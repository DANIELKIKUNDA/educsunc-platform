import type { SqlQueryClient } from '../../../../../infrastructure/persistence/SqlQueryClient';
import { obtenirClientPostgresAuth } from '../../../../../auth/infrastructure/persistence/postgres/ClientPoolPostgresAuth';

export class PostgresAuditOperationalReader {
  public constructor(private readonly client: SqlQueryClient = obtenirClientPostgresAuth()) {}

  public async compterEntrees(organisationId?: string, ecoleId?: string): Promise<number> {
    const clauses: string[] = [];
    const valeurs: unknown[] = [];
    if (organisationId) { valeurs.push(organisationId); clauses.push(`organisation_id=$${valeurs.length}`); }
    if (ecoleId) { valeurs.push(ecoleId); clauses.push(`ecole_id=$${valeurs.length}`); }
    const resultat = await this.client.executer<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM audit_entries${clauses.length ? ` WHERE ${clauses.join(' AND ')}` : ''}`,
      valeurs,
    );
    return Number(resultat.lignes[0]?.total ?? 0);
  }

  public async compterDocuments(type: string): Promise<number> {
    const resultat = await this.client.executer<{ total: string }>(
      'SELECT COUNT(*)::text AS total FROM audit_runtime_documents WHERE document_type=$1', [type],
    );
    return Number(resultat.lignes[0]?.total ?? 0);
  }

  public async compterCorrelations(): Promise<number> {
    const resultat = await this.client.executer<{ total: string }>(
      'SELECT COUNT(DISTINCT correlation_id)::text AS total FROM audit_entries WHERE correlation_id IS NOT NULL',
    );
    return Number(resultat.lignes[0]?.total ?? 0);
  }

  public async compterExportsL5(statut?: string): Promise<number> {
    const resultat = await this.client.executer<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM audit_export_jobs${statut ? ' WHERE statut=$1' : ''}`,
      statut ? [statut] : [],
    );
    return Number(resultat.lignes[0]?.total ?? 0);
  }

  public async compterReplaysL5(statut?: string): Promise<number> {
    const resultat = await this.client.executer<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM audit_replay_runs${statut ? ' WHERE statut=$1' : ''}`,
      statut ? [statut] : [],
    );
    return Number(resultat.lignes[0]?.total ?? 0);
  }

  public async compterEchecsIntegrite(): Promise<number> {
    const resultat = await this.client.executer<{ total: string }>(
      `SELECT (
         (SELECT COUNT(*) FROM audit_entries e
          LEFT JOIN audit_integrity_seals s ON s.audit_entry_id=e.id_audit_entry
          WHERE s.audit_entry_id IS NULL)
         +
         (SELECT COUNT(*) FROM audit_entries WHERE action='ANOMALIE_INTEGRITE_DETECTEE')
       )::text AS total`,
    );
    return Number(resultat.lignes[0]?.total ?? 0);
  }

  public async sommeExportsL5(colonne: 'taille_octets' | 'duree_secondes'): Promise<number> {
    const expression = colonne === 'taille_octets'
      ? 'COALESCE(SUM(taille_octets),0)'
      : "COALESCE(SUM(EXTRACT(EPOCH FROM (termine_le-commence_le))),0)";
    const resultat = await this.client.executer<{ total: string }>(
      `SELECT ${expression}::text AS total FROM audit_export_jobs WHERE statut='COMPLETED'`,
    );
    return Number(resultat.lignes[0]?.total ?? 0);
  }

  public async sommeDureeReplaysL5(): Promise<number> {
    const resultat = await this.client.executer<{ total: string }>(
      `SELECT COALESCE(SUM(EXTRACT(EPOCH FROM (termine_le-demande_le))),0)::text AS total
       FROM audit_replay_runs WHERE statut IN ('COMPLETED','FAILED')`,
    );
    return Number(resultat.lignes[0]?.total ?? 0);
  }

  public async statistiquesRetentionL5(): Promise<{ archives: number; dureeSecondes: number }> {
    const resultat = await this.client.executer<{ archives: string; duree_secondes: string }>(
      `SELECT
         (SELECT COUNT(*) FROM audit_archive_memberships)::text AS archives,
         COALESCE(SUM(EXTRACT(EPOCH FROM (termine_le-commence_le))),0)::text AS duree_secondes
       FROM audit_retention_runs WHERE statut='COMPLETED'`,
    );
    return {
      archives: Number(resultat.lignes[0]?.archives ?? 0),
      dureeSecondes: Number(resultat.lignes[0]?.duree_secondes ?? 0),
    };
  }

  public async compterVerificationsIntegrite(): Promise<number> {
    const resultat = await this.client.executer<{ total: string }>(
      "SELECT COUNT(*)::text AS total FROM audit_entries WHERE action='VERIFICATION_INTEGRITE_EXECUTEE'",
    );
    return Number(resultat.lignes[0]?.total ?? 0);
  }

  public async activiteTenants(): Promise<Array<{ tenant: string; total: number }>> {
    const resultat = await this.client.executer<{ organisation_id: string | null; ecole_id: string | null; total: string }>(
      `SELECT organisation_id,ecole_id,COUNT(*)::text AS total FROM audit_entries
       GROUP BY organisation_id,ecole_id ORDER BY COUNT(*) DESC`,
    );
    return resultat.lignes.map((ligne) => ({
      tenant: `${ligne.organisation_id ?? 'NA'}|${ligne.ecole_id ?? 'NA'}`,
      total: Number(ligne.total),
    }));
  }
}
