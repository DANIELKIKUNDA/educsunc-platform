import type { PoolClient } from 'pg';
import type { MigrationPostgresConfiguration } from './MigrationPostgresConfiguration';

interface DoublonConfiguration {
  cle: string;
  scope_niveau: string;
  organisation_id: string | null;
  ecole_id: string | null;
  utilisateur_id: string | null;
  total: string;
}

export class Migration_002_IndustrialiserIntegriteConfiguration implements MigrationPostgresConfiguration {
  public readonly version = 2;
  public readonly nom = 'IndustrialiserIntegriteConfiguration';

  public async executer(client: PoolClient): Promise<void> {
    await client.query(`
      ALTER TABLE educsyn_configuration_entries
      ADD COLUMN IF NOT EXISTS revision BIGINT NOT NULL DEFAULT 0
    `);

    const doublons = await client.query<DoublonConfiguration>(`
      SELECT cle, scope_niveau, organisation_id, ecole_id, utilisateur_id, COUNT(*)::text AS total
      FROM educsyn_configuration_entries
      GROUP BY cle, scope_niveau, organisation_id, ecole_id, utilisateur_id
      HAVING COUNT(*) > 1
      LIMIT 10
    `);

    if (doublons.rows.length > 0) {
      throw new Error(
        `La migration Configuration a detecte des cles dupliquees: ${JSON.stringify(doublons.rows)}`,
      );
    }

    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_educsyn_configuration_entries_key_scope
      ON educsyn_configuration_entries (
        cle,
        scope_niveau,
        COALESCE(organisation_id, ''),
        COALESCE(ecole_id, ''),
        COALESCE(utilisateur_id, '')
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS educsyn_configuration_audit_events (
        event_id TEXT PRIMARY KEY,
        configuration_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        payload JSONB NOT NULL,
        occurred_at TIMESTAMPTZ NOT NULL,
        persisted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_educsyn_configuration_audit_resource
      ON educsyn_configuration_audit_events (configuration_id, occurred_at DESC)
    `);
  }
}
