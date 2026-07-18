import type { AuditEntry } from '../../../../domain/aggregates';
import type { AuditEntryRepository, AuditSearchFilters } from '../../../../domain/repositories';
import type { SqlQueryClient } from '../../../../../infrastructure/persistence/SqlQueryClient';
import { obtenirClientPostgresAuth } from '../../../../../auth/infrastructure/persistence/postgres/ClientPoolPostgresAuth';
import { AuditEntryPersistenceMapper } from '../mappers/AuditEntryPersistenceMapper';
import type { AuditCategoryRow, AuditEntryRow } from '../mappers/AuditPersistenceRecords';

type ClientTransactionnel = SqlQueryClient & { dansTransaction?<T>(operation: () => Promise<T>): Promise<T> };
const CHAMPS_SENSIBLES = /password|mot.?de.?passe|token|jwt|cookie|secret|hash|authorization/i;

function assainirJson(valeur: unknown): unknown {
  if (Array.isArray(valeur)) return valeur.map(assainirJson);
  if (valeur && typeof valeur === 'object') {
    return Object.fromEntries(Object.entries(valeur as Record<string, unknown>)
      .filter(([cle]) => !CHAMPS_SENSIBLES.test(cle))
      .map(([cle, contenu]) => [cle, assainirJson(contenu)]));
  }
  return valeur;
}

export class PostgresAuditEntryRepository implements AuditEntryRepository {
  constructor(private readonly clientSql: ClientTransactionnel = obtenirClientPostgresAuth()) {}

  public async ajouterAudit(entree: AuditEntry): Promise<void> {
    await this.dansTransaction(async () => {
      const { auditEntry: row, categories } = AuditEntryPersistenceMapper.versRows(entree);
      await this.clientSql.executer(
        `INSERT INTO audit_entries (
           id_audit_entry,action,type_principal,gravite,niveau,resultat,request_id,
           correlation_id,session_id,sync_id,replay_id,acteur_id,type_acteur,role_actif,
           type_ressource,id_ressource,libelle_ressource,organisation_id,ecole_id,scope,
           mode_offline,statut_synchronisation,retry_count,est_replay,est_retry,adresse_ip,
           user_agent,device_id,source_audit,source_runtime,version_application,date_action,
           date_creation_audit,date_synchronisation,ancien_etat,nouvel_etat,metadata,
           contexte_permissions,contexte_execution
         ) VALUES (
           $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
           $21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35::jsonb,$36::jsonb,
           $37::jsonb,$38::jsonb,$39::jsonb
         ) ON CONFLICT (id_audit_entry) DO NOTHING`,
        [row.id_audit_entry,row.action,row.type_principal,row.gravite,row.niveau,row.resultat,
          row.request_id,row.correlation_id,row.session_id,row.sync_id,row.replay_id,row.acteur_id,
          row.type_acteur,row.role_actif,row.type_ressource,row.id_ressource,row.libelle_ressource,
          row.organisation_id,row.ecole_id,row.scope,row.mode_offline,row.statut_synchronisation,
          row.retry_count,row.est_replay,row.est_retry,row.adresse_ip,row.user_agent,row.device_id,
          row.source_audit,row.source_runtime,row.version_application,row.date_action,
          row.date_creation_audit,row.date_synchronisation,
          this.json(row.ancien_etat),this.json(row.nouvel_etat),this.json(row.metadata),
          this.json(row.contexte_permissions),this.json(row.contexte_execution)],
      );
      for (const categorie of categories) {
        await this.clientSql.executer(
          `INSERT INTO audit_categories(audit_entry_id,categorie)
           VALUES ($1,$2) ON CONFLICT (audit_entry_id,categorie) DO NOTHING`,
          [row.id_audit_entry,categorie.categorie],
        );
      }
    });
  }

  public async trouverParId(idAudit: string): Promise<AuditEntry | null> {
    const entrees = await this.charger('e.id_audit_entry=$1', [idAudit]);
    return entrees[0] ?? null;
  }

  public async trouverParCorrelationId(correlationId: string): Promise<AuditEntry[]> {
    return this.charger('e.correlation_id=$1', [correlationId]);
  }

  public async trouverParRequestId(requestId: string): Promise<AuditEntry[]> {
    return this.charger('e.request_id=$1', [requestId]);
  }

  public async trouverParTenant(params: { organisationId?: string; ecoleId?: string; scope?: string }): Promise<AuditEntry[]> {
    return this.listerSelonFiltres(params);
  }

  public async listerSelonFiltres(filtres: AuditSearchFilters): Promise<AuditEntry[]> {
    const clauses: string[] = [];
    const valeurs: unknown[] = [];
    const ajouter = (colonne: string, valeur: unknown) => {
      valeurs.push(valeur);
      clauses.push(`${colonne}=$${valeurs.length}`);
    };
    if (filtres.organisationId) ajouter('e.organisation_id', filtres.organisationId);
    if (filtres.ecoleId) ajouter('e.ecole_id', filtres.ecoleId);
    if (filtres.scope) ajouter('e.scope', filtres.scope);
    if (filtres.acteurId) ajouter('e.acteur_id', filtres.acteurId);
    if (filtres.typeActeur) ajouter('e.type_acteur', filtres.typeActeur);
    if (filtres.typeAuditPrincipal) ajouter('e.type_principal', filtres.typeAuditPrincipal);
    if (filtres.actionAudit) ajouter('e.action', filtres.actionAudit);
    if (filtres.graviteAudit) ajouter('e.gravite', filtres.graviteAudit);
    if (filtres.niveauAudit) ajouter('e.niveau', filtres.niveauAudit);
    if (filtres.resultatAudit) ajouter('e.resultat', filtres.resultatAudit);
    if (filtres.typeRessource) ajouter('e.type_ressource', filtres.typeRessource);
    if (filtres.idRessource) ajouter('e.id_ressource', filtres.idRessource);
    if (filtres.correlationId) ajouter('e.correlation_id', filtres.correlationId);
    if (filtres.requestId) ajouter('e.request_id', filtres.requestId);
    if (filtres.sessionId) ajouter('e.session_id', filtres.sessionId);
    if (filtres.deviceId) ajouter('e.device_id', filtres.deviceId);
    if (filtres.adresseIp) ajouter('e.adresse_ip', filtres.adresseIp);
    if (filtres.sourceAudit) ajouter('e.source_audit', filtres.sourceAudit);
    if (filtres.sourceRuntime) ajouter('e.source_runtime', filtres.sourceRuntime);
    if (typeof filtres.modeOffline === 'boolean') ajouter('e.mode_offline', filtres.modeOffline);
    if (typeof filtres.replay === 'boolean') ajouter('e.est_replay', filtres.replay);
    if (typeof filtres.retry === 'boolean') ajouter('e.est_retry', filtres.retry);
    if (filtres.categorieAudit) {
      valeurs.push(filtres.categorieAudit);
      clauses.push(`EXISTS(SELECT 1 FROM audit_categories c WHERE c.audit_entry_id=e.id_audit_entry AND c.categorie=$${valeurs.length})`);
    }
    if (filtres.dateDebut) { valeurs.push(filtres.dateDebut); clauses.push(`e.date_action >= $${valeurs.length}`); }
    if (filtres.dateFin) { valeurs.push(filtres.dateFin); clauses.push(`e.date_action <= $${valeurs.length}`); }
    return this.charger(clauses.length ? clauses.join(' AND ') : 'TRUE', valeurs);
  }

  public async existe(idAudit: string): Promise<boolean> {
    const resultat = await this.clientSql.executer<{ existe: boolean }>(
      'SELECT EXISTS(SELECT 1 FROM audit_entries WHERE id_audit_entry=$1) AS existe', [idAudit],
    );
    return resultat.lignes[0]?.existe ?? false;
  }

  public async ajouter(entree: AuditEntry): Promise<void> { return this.ajouterAudit(entree); }
  public async rechercherParId(idAudit: string): Promise<AuditEntry | null> { return this.trouverParId(idAudit); }
  public async rechercherParCorrelationId(correlationId: string): Promise<AuditEntry[]> { return this.trouverParCorrelationId(correlationId); }
  public async rechercherParTenant(params: { organisationId?: string; ecoleId?: string; scope?: string }): Promise<AuditEntry[]> { return this.trouverParTenant(params); }

  private async charger(condition: string, parametres: readonly unknown[]): Promise<AuditEntry[]> {
    const resultat = await this.clientSql.executer<AuditEntryRow>(
      `SELECT e.* FROM audit_entries e WHERE ${condition} ORDER BY e.date_action DESC`, parametres,
    );
    if (resultat.lignes.length === 0) return [];
    const ids = resultat.lignes.map((ligne) => ligne.id_audit_entry);
    const categories = await this.clientSql.executer<AuditCategoryRow>(
      'SELECT id,audit_entry_id,categorie FROM audit_categories WHERE audit_entry_id=ANY($1::text[]) ORDER BY id', [ids],
    );
    return resultat.lignes.map((ligne) => AuditEntryPersistenceMapper.depuisRows(
      ligne, categories.lignes.filter((categorie) => categorie.audit_entry_id === ligne.id_audit_entry),
    ));
  }

  private async dansTransaction<T>(operation: () => Promise<T>): Promise<T> {
    return this.clientSql.dansTransaction ? this.clientSql.dansTransaction(operation) : operation();
  }

  private json(valeur: unknown): string | null {
    return valeur === null || valeur === undefined ? null : JSON.stringify(assainirJson(valeur));
  }
}
