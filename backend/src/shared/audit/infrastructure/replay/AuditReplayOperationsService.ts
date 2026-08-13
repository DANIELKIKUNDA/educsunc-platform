import { createHash, randomUUID } from 'node:crypto';
import type { SqlQueryClient } from '../../../infrastructure/persistence/SqlQueryClient';
import { obtenirClientPostgresAuth } from '../../../auth/infrastructure/persistence/postgres/ClientPoolPostgresAuth';
import type { AuditReadRepositoryPort } from '../../application/ports/outbound/AuditReadRepositoryPort';
import { PostgresAuditEntryRepository } from '../persistence/postgres/repositories/PostgresAuditEntryRepository';
import { PostgresAuditProjectionHandler } from '../persistence/postgres/projections/PostgresAuditProjectionHandler';
import { PostgresAuditProjectionProjector } from '../persistence/postgres/projections/PostgresAuditProjectionProjector';
import { PostgresAuditProjectionRepository } from '../persistence/postgres/repositories/PostgresAuditProjectionRepository';
import { serialiserAuditCanoniquement } from '../security/integrity/CanonicalAuditSerializer';

type ReplayTarget = 'PROJECTIONS' | 'ANALYTICS';

interface ReplayRunRow {
  id_replay: string;
  statut: string;
  cible: string;
  mode: string;
  resultat: Record<string, unknown> | string | null;
  erreur: string | null;
}

export class AuditReplayOperationsService {
  public constructor(
    private readonly lectures: AuditReadRepositoryPort,
    private readonly entries: PostgresAuditEntryRepository,
    private readonly projections: PostgresAuditProjectionHandler,
    private readonly sql: SqlQueryClient = obtenirClientPostgresAuth(),
    private readonly auditer: (payload: Record<string, unknown>, resultat: 'SUCCESS' | 'FAILED' | 'IGNORED_DUPLICATE') => Promise<void> = async () => undefined,
    private readonly projectionRepository = new PostgresAuditProjectionRepository(),
  ) {}

  public async executer(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    const cible = this.cible(payload.cible);
    const mode = payload.mode === 'EXECUTE' ? 'EXECUTE' : 'DRY_RUN';
    const raison = this.texte(payload.raison) ?? '';
    if (raison.length < 10 || raison.length > 500) {
      throw new Error('Une raison explicite de 10 a 500 caracteres est requise pour le replay.');
    }
    const scope = this.scope(payload.scope);
    const organisationId = this.texte(payload.organisationId);
    const ecoleId = this.texte(payload.ecoleId);
    this.verifierTenant(scope, organisationId, ecoleId);
    const limite = typeof payload.limite === 'number' ? Math.min(Math.max(payload.limite, 1), 1_000) : 100;
    const demandeReplayId = this.texte(payload.replayId) ?? this.texte(payload.correlationId) ?? randomUUID();
    const idempotencyKey = createHash('sha256').update(serialiserAuditCanoniquement({
      demandeReplayId, cible, mode, scope, organisationId, ecoleId,
    })).digest('hex');
    const idReplay = randomUUID();
    const statutInitial = mode === 'DRY_RUN' ? 'VALIDATED' : 'PROCESSING';
    const insertion = await this.sql.executer<ReplayRunRow>(
      `INSERT INTO audit_replay_runs(
         id_replay,cible,mode,statut,requester_id,scope,organisation_id,ecole_id,
         raison,idempotency_key,correlation_id
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (idempotency_key) DO NOTHING RETURNING *`,
      [idReplay, cible, mode, statutInitial, this.texte(payload.requesterId) ?? null, scope,
        scope === 'PLATEFORME' ? null : organisationId ?? null,
        scope === 'ECOLE' ? ecoleId ?? null : null, raison, idempotencyKey,
        this.texte(payload.correlationId) ?? null],
    );
    if (!insertion.lignes[0]) {
      const resultat = await this.relireIdempotent(idempotencyKey);
      await this.auditer({ ...payload, replayId: resultat.replayId }, 'IGNORED_DUPLICATE');
      return resultat;
    }

    const page = await this.lectures.rechercher({
      organisationId: scope === 'PLATEFORME' ? undefined : organisationId,
      ecoleId: scope === 'ECOLE' ? ecoleId : undefined,
      correlationId: this.texte(payload.correlationId),
    }, { limite });
    const apercu = {
      replayId: idReplay, cible, mode,
      statut: mode === 'DRY_RUN' ? 'VALIDATED' : 'PROCESSING',
      evenementsCompatibles: page.items.length,
      mutationsMetier: 0,
      limite,
      tronque: page.hasNextPage,
    };
    if (mode === 'DRY_RUN') {
      await this.sql.executer(
        'UPDATE audit_replay_runs SET resultat=$2::jsonb,termine_le=NOW() WHERE id_replay=$1',
        [idReplay, JSON.stringify(apercu)],
      );
      await this.auditer({ ...payload, replayId: idReplay }, 'SUCCESS');
      return apercu;
    }

    try {
      let reconstruites = 0;
      for (const sortie of page.items) {
        const entree = await this.entries.trouverParId(sortie.idAuditEntry);
        if (!entree) continue;
        if (cible === 'PROJECTIONS') {
          await this.projections.traiterAuditEntryCreated(entree);
        } else {
          const construites = new PostgresAuditProjectionProjector(this.projectionRepository)
            .construire(entree)
            .filter((projection) => projection.typeProjection === 'ANALYTICS' || projection.typeProjection === 'VOLUMETRIE');
          for (const projection of construites) await this.projectionRepository.enregistrerProjection(projection);
        }
        reconstruites += 1;
      }
      const resultat = { ...apercu, statut: 'COMPLETED', reconstruites };
      await this.sql.executer(
        `UPDATE audit_replay_runs SET statut='COMPLETED',resultat=$2::jsonb,termine_le=NOW()
         WHERE id_replay=$1 AND statut='PROCESSING'`,
        [idReplay, JSON.stringify(resultat)],
      );
      await this.auditer({ ...payload, replayId: idReplay }, 'SUCCESS');
      return resultat;
    } catch (erreur) {
      const message = erreur instanceof Error ? erreur.message : 'Le replay de projection a echoue.';
      await this.sql.executer(
        `UPDATE audit_replay_runs SET statut='FAILED',erreur=$2,termine_le=NOW()
         WHERE id_replay=$1 AND statut='PROCESSING'`, [idReplay, message.slice(0, 500)],
      );
      await this.auditer({ ...payload, replayId: idReplay }, 'FAILED');
      throw erreur;
    }
  }

  public async reprendreInterrompus(): Promise<void> {
    await this.sql.executer(
      `UPDATE audit_replay_runs SET statut='FAILED',erreur='Replay interrompu avant confirmation',termine_le=NOW()
       WHERE statut='PROCESSING' AND demande_le < NOW() - INTERVAL '15 minutes'`,
    );
  }

  private async relireIdempotent(cle: string): Promise<Record<string, unknown>> {
    const resultat = await this.sql.executer<ReplayRunRow>(
      'SELECT * FROM audit_replay_runs WHERE idempotency_key=$1 LIMIT 1', [cle],
    );
    const run = resultat.lignes[0];
    if (!run) throw new Error("Le replay idempotent n'a pas pu etre relu.");
    const details = typeof run.resultat === 'string' ? JSON.parse(run.resultat) as Record<string, unknown> : run.resultat ?? {};
    return { ...details, replayId: run.id_replay, cible: run.cible, mode: run.mode, statut: run.statut, idempotent: true, erreur: run.erreur ?? undefined };
  }

  private cible(value: unknown): ReplayTarget {
    if (value === 'PROJECTIONS' || value === 'ANALYTICS') return value;
    throw new Error("Seules les reconstructions de projections Audit sont replayables.");
  }

  private scope(value: unknown): 'PLATEFORME' | 'ORGANISATION' | 'ECOLE' {
    if (value === 'PLATEFORME' || value === 'ORGANISATION' || value === 'ECOLE') return value;
    throw new Error('Le perimetre authentifie du replay est invalide.');
  }

  private verifierTenant(scope: string, organisationId?: string, ecoleId?: string): void {
    if (scope === 'ORGANISATION' && !organisationId) throw new Error('Le contexte organisation est requis.');
    if (scope === 'ECOLE' && (!organisationId || !ecoleId)) throw new Error('Le contexte ecole est requis.');
  }

  private texte(value: unknown): string | undefined {
    return typeof value === 'string' && value.trim() ? value.trim() : undefined;
  }
}
