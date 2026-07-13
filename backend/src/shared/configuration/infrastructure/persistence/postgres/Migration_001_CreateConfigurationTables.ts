import type { PoolClient } from 'pg';
import type { MigrationPostgresConfiguration } from './MigrationPostgresConfiguration';

export class Migration_001_CreateConfigurationTables implements MigrationPostgresConfiguration {
  public readonly version = 1;
  public readonly nom = 'CreateConfigurationTables';

  public async executer(client: PoolClient): Promise<void> {
    await client.query(`
      CREATE TABLE IF NOT EXISTS educsyn_configuration_entries (
        identifiant TEXT PRIMARY KEY,
        cle TEXT NOT NULL,
        valeur JSONB NOT NULL,
        statut TEXT NOT NULL,
        scope_niveau TEXT NOT NULL,
        organisation_id TEXT NULL,
        ecole_id TEXT NULL,
        utilisateur_id TEXT NULL,
        gouvernance JSONB NOT NULL,
        overrides JSONB NOT NULL DEFAULT '[]'::jsonb,
        verrou JSONB NULL,
        total_versions INTEGER NOT NULL DEFAULT 0,
        cree_le TIMESTAMPTZ NOT NULL,
        sauvegarde_le TIMESTAMPTZ NOT NULL
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS educsyn_configuration_versions (
        configuration_id TEXT NOT NULL,
        numero_version INTEGER NOT NULL,
        valeur JSONB NOT NULL,
        changement JSONB NOT NULL,
        cree_le TIMESTAMPTZ NOT NULL,
        PRIMARY KEY (configuration_id, numero_version)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS educsyn_configuration_snapshots (
        identifiant_snapshot TEXT PRIMARY KEY,
        configuration_id TEXT NOT NULL,
        valeurs JSONB NOT NULL,
        cree_le TIMESTAMPTZ NOT NULL,
        sauvegarde_le TIMESTAMPTZ NOT NULL
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS educsyn_configuration_bootstrap_journal (
        execution_id TEXT PRIMARY KEY,
        executed_at TIMESTAMPTZ NOT NULL,
        type_evenement TEXT NOT NULL,
        scope JSONB NOT NULL,
        created_keys JSONB NOT NULL,
        skipped_keys JSONB NOT NULL
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_educsyn_configuration_entries_scope
      ON educsyn_configuration_entries (scope_niveau, organisation_id, ecole_id, utilisateur_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_educsyn_configuration_entries_key
      ON educsyn_configuration_entries (cle)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_educsyn_configuration_snapshots_configuration
      ON educsyn_configuration_snapshots (configuration_id, cree_le DESC)
    `);
  }
}
