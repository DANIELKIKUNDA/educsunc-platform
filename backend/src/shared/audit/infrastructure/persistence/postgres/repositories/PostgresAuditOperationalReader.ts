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
