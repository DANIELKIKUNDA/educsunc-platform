import type { Pool } from 'pg';
import { Migration_001_CreateConfigurationTables } from './Migration_001_CreateConfigurationTables';
import { Migration_002_IndustrialiserIntegriteConfiguration } from './Migration_002_IndustrialiserIntegriteConfiguration';
import type { MigrationPostgresConfiguration } from './MigrationPostgresConfiguration';

export class MigrateurPostgresConfiguration {
  private readonly migrations: readonly MigrationPostgresConfiguration[] = [
    new Migration_001_CreateConfigurationTables(),
    new Migration_002_IndustrialiserIntegriteConfiguration(),
  ];

  constructor(private readonly pool: Pool) {}

  public async executerToutes(): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query("SELECT pg_advisory_xact_lock(hashtext('educsyn_configuration_migrations'))");
      await client.query(`
        CREATE TABLE IF NOT EXISTS educsyn_configuration_schema_migrations (
          version INTEGER PRIMARY KEY,
          nom TEXT NOT NULL,
          appliquee_le TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);

      for (const migration of this.migrations) {
        const dejaAppliquee = await client.query<{ version: number }>(
          'SELECT version FROM educsyn_configuration_schema_migrations WHERE version = $1',
          [migration.version],
        );
        if (dejaAppliquee.rowCount) {
          continue;
        }

        await migration.executer(client);
        await client.query(
          'INSERT INTO educsyn_configuration_schema_migrations (version, nom) VALUES ($1, $2)',
          [migration.version, migration.nom],
        );
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
