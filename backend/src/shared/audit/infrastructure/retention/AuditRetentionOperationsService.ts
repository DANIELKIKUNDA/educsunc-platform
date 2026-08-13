import { randomUUID } from 'node:crypto';
import type { SqlQueryClient } from '../../../infrastructure/persistence/SqlQueryClient';
import { obtenirClientPostgresAuth } from '../../../auth/infrastructure/persistence/postgres/ClientPoolPostgresAuth';
import type { AuditRetentionOperationsPort } from '../../application/ports/outbound/AuditRetentionOperationsPort';
import type { SearchAuditQuery } from '../../application/dto/queries/SearchAuditQuery';
import type { AuditAnalyticsOutput } from '../../application/dto/outputs/AuditAnalyticsOutput';
import type { AuditSearchResultOutput } from '../../application/dto/outputs/AuditSearchResultOutput';
import type { AuditReadRepositoryPort } from '../../application/ports/outbound/AuditReadRepositoryPort';

interface CountRow { total: string | number }
interface ArchiveIdRow { audit_entry_id: string }

export class AuditRetentionOperationsService implements AuditRetentionOperationsPort {
  private readonly tailleLot = 500;

  public constructor(
    private readonly lectures: AuditReadRepositoryPort,
    private readonly sql: SqlQueryClient = obtenirClientPostgresAuth(),
    private readonly auditer: (payload: SearchAuditQuery, resultat: 'SUCCESS' | 'FAILED', idRun: string) => Promise<void> = async () => undefined,
  ) {}

  public async preparer(payload: SearchAuditQuery): Promise<AuditAnalyticsOutput> {
    const dateLimite = this.dateLimite(payload);
    const candidats = await this.compterCandidats(payload, dateLimite);
    const automatique = this.politiqueAutomatique();
    await this.enregistrerRun('EVALUATION', payload, { dateLimite, automatique }, candidats, 0);
    return {
      periode: dateLimite,
      valeurs: { candidatsArchivage: candidats, politiqueAutomatiqueActive: automatique ? 1 : 0 },
      compteurs: { tailleLot: this.tailleLot, suppressionPhysique: 0 },
    };
  }

  public async archiver(payload: SearchAuditQuery): Promise<AuditAnalyticsOutput> {
    const dateLimite = this.dateLimite(payload);
    const raison = payload.raison?.trim() ?? '';
    if (raison.length < 10 || raison.length > 500) {
      throw new Error("Une raison explicite de 10 a 500 caracteres est requise pour l'archivage.");
    }
    const idRun = randomUUID();
    const candidats = await this.compterCandidats(payload, dateLimite);
    await this.creerRun(idRun, 'ARCHIVE', payload, { dateLimite, raison }, candidats);
    try {
      const { clauses, valeurs } = this.where(payload, dateLimite);
      valeurs.push(this.tailleLot, idRun, raison);
      const resultat = await this.sql.executer<ArchiveIdRow>(
        `WITH candidats AS (
           SELECT e.id_audit_entry FROM audit_entries e
           LEFT JOIN audit_archive_memberships a ON a.audit_entry_id=e.id_audit_entry
           WHERE ${clauses.join(' AND ')} AND a.audit_entry_id IS NULL
           ORDER BY e.date_action,e.id_audit_entry LIMIT $${valeurs.length - 2}
         )
         INSERT INTO audit_archive_memberships(audit_entry_id,retention_run_id,raison)
         SELECT id_audit_entry,$${valeurs.length - 1},$${valeurs.length} FROM candidats
         ON CONFLICT (audit_entry_id) DO NOTHING RETURNING audit_entry_id`,
        valeurs,
      );
      await this.terminerRun(idRun, resultat.lignes.length);
      await this.auditer(payload, 'SUCCESS', idRun);
      return {
        periode: dateLimite,
        valeurs: { archives: resultat.lignes.length, restantsEstimes: Math.max(0, candidats - resultat.lignes.length) },
        compteurs: { tailleLot: this.tailleLot, suppressionPhysique: 0 },
      };
    } catch (erreur) {
      await this.echouerRun(idRun, erreur);
      await this.auditer(payload, 'FAILED', idRun);
      throw erreur;
    }
  }

  public async consulter(payload: SearchAuditQuery): Promise<AuditSearchResultOutput> {
    const page = Math.max(1, payload.page ?? 1);
    const taille = Math.min(100, Math.max(1, payload.taillePage ?? 25));
    const offset = (page - 1) * taille;
    const { clauses, valeurs } = this.where(payload);
    const count = await this.sql.executer<CountRow>(
      `SELECT COUNT(*) AS total FROM audit_archive_memberships a
       JOIN audit_entries e ON e.id_audit_entry=a.audit_entry_id WHERE ${clauses.join(' AND ')}`,
      valeurs,
    );
    valeurs.push(taille, offset);
    const ids = await this.sql.executer<ArchiveIdRow>(
      `SELECT a.audit_entry_id FROM audit_archive_memberships a
       JOIN audit_entries e ON e.id_audit_entry=a.audit_entry_id
       WHERE ${clauses.join(' AND ')} ORDER BY a.archived_at DESC,a.audit_entry_id DESC
       LIMIT $${valeurs.length - 1} OFFSET $${valeurs.length}`,
      valeurs,
    );
    const items = (await Promise.all(ids.lignes.map((row) => this.lectures.obtenirParId({
      idAuditEntry: row.audit_entry_id,
      organisationId: payload.scope === 'PLATEFORME' ? undefined : payload.organisationId,
      ecoleId: payload.scope === 'ECOLE' ? payload.ecoleId : undefined,
    })))).filter((item): item is NonNullable<typeof item> => item !== null);
    const total = Number(count.lignes[0]?.total ?? 0);
    const totalPages = Math.ceil(total / taille);
    return { total, page, taillePage: taille, totalPages, hasNextPage: page < totalPages, items,
      pagination: { page, taille, total, totalPages, hasNextPage: page < totalPages } };
  }

  public async apercuPurge(payload: SearchAuditQuery): Promise<AuditAnalyticsOutput> {
    const dateLimite = this.dateLimite(payload);
    const candidats = await this.compterCandidats(payload, dateLimite, true);
    await this.enregistrerRun('PURGE_PREVIEW', payload, { dateLimite, destructive: false }, candidats, 0);
    return {
      periode: dateLimite,
      valeurs: { candidatsPurge: candidats, purgeExecutee: 0 },
      compteurs: { politiqueDestructiveActive: 0 },
    };
  }

  public async reprendreInterrompus(): Promise<void> {
    await this.sql.executer(
      `UPDATE audit_retention_runs SET statut='FAILED',
         erreur='Cycle interrompu avant confirmation; les appartenances deja archivees sont conservees',
         termine_le=NOW()
       WHERE statut='PROCESSING' AND commence_le < NOW() - INTERVAL '15 minutes'`,
    );
  }

  private async compterCandidats(payload: SearchAuditQuery, dateLimite: string, archivesUniquement = false): Promise<number> {
    const { clauses, valeurs } = this.where(payload, dateLimite);
    clauses.push(archivesUniquement ? 'a.audit_entry_id IS NOT NULL' : 'a.audit_entry_id IS NULL');
    const resultat = await this.sql.executer<CountRow>(
      `SELECT COUNT(*) AS total FROM audit_entries e
       LEFT JOIN audit_archive_memberships a ON a.audit_entry_id=e.id_audit_entry
       WHERE ${clauses.join(' AND ')}`, valeurs,
    );
    return Number(resultat.lignes[0]?.total ?? 0);
  }

  private where(payload: SearchAuditQuery, dateLimite?: string): { clauses: string[]; valeurs: unknown[] } {
    const clauses = ['TRUE'];
    const valeurs: unknown[] = [];
    const egal = (colonne: string, valeur: unknown) => {
      if (valeur === undefined) return;
      valeurs.push(valeur);
      clauses.push(`${colonne}=$${valeurs.length}`);
    };
    if (payload.scope !== 'PLATEFORME') egal('e.organisation_id', payload.organisationId);
    if (payload.scope === 'ECOLE') egal('e.ecole_id', payload.ecoleId);
    egal('e.action', payload.action);
    egal('e.gravite', payload.gravite);
    egal('e.resultat', payload.resultat);
    if (dateLimite) {
      valeurs.push(dateLimite);
      clauses.push(`e.date_action < $${valeurs.length}::timestamptz`);
    }
    return { clauses, valeurs };
  }

  private dateLimite(payload: SearchAuditQuery): string {
    if (!payload.dateFin || Number.isNaN(Date.parse(payload.dateFin))) {
      throw new Error('Une date limite explicite est requise. Aucune duree legale automatique n est inventee.');
    }
    if (Date.parse(payload.dateFin) >= Date.now()) throw new Error('La date limite doit etre anterieure a maintenant.');
    return new Date(payload.dateFin).toISOString();
  }

  private politiqueAutomatique(): boolean {
    const jours = Number(process.env.EDUCSYN_AUDIT_RETENTION_DAYS ?? 0);
    return Number.isSafeInteger(jours) && jours > 0 && process.env.EDUCSYN_AUDIT_RETENTION_AUTO === '1';
  }

  private async enregistrerRun(operation: 'EVALUATION' | 'PURGE_PREVIEW', payload: SearchAuditQuery, politique: object, candidats: number, traites: number): Promise<void> {
    const id = randomUUID();
    await this.creerRun(id, operation, payload, politique, candidats);
    await this.terminerRun(id, traites);
  }

  private async creerRun(id: string, operation: 'EVALUATION' | 'ARCHIVE' | 'PURGE_PREVIEW', payload: SearchAuditQuery, politique: object, candidats: number): Promise<void> {
    const scope = payload.scope ?? 'ECOLE';
    await this.sql.executer(
      `INSERT INTO audit_retention_runs(id_run,operation,statut,scope,organisation_id,ecole_id,requester_id,politique,candidats)
       VALUES ($1,$2,'PROCESSING',$3,$4,$5,$6,$7::jsonb,$8)`,
      [id, operation, scope, scope === 'PLATEFORME' ? null : payload.organisationId ?? null,
        scope === 'ECOLE' ? payload.ecoleId ?? null : null, payload.demandeurId ?? null,
        JSON.stringify(politique), candidats],
    );
  }

  private async terminerRun(id: string, traites: number): Promise<void> {
    await this.sql.executer(
      `UPDATE audit_retention_runs SET statut='COMPLETED',traites=$2,termine_le=NOW() WHERE id_run=$1`, [id, traites],
    );
  }

  private async echouerRun(id: string, erreur: unknown): Promise<void> {
    const message = erreur instanceof Error ? erreur.message : "L'archivage logique a echoue.";
    await this.sql.executer(
      `UPDATE audit_retention_runs SET statut='FAILED',erreur=$2,termine_le=NOW() WHERE id_run=$1`, [id, message.slice(0, 500)],
    );
  }
}
