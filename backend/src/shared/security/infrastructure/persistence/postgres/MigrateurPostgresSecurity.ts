import type { Pool } from 'pg';
import { Migration_001_CreateSecurityTables } from './Migration_001_CreateSecurityTables';
import { Migration_002_SeedSecurityGovernance } from './Migration_002_SeedSecurityGovernance';
import { Migration_003_UnifySecurityAudit } from './Migration_003_UnifySecurityAudit';
import { Migration_004_RefreshSecurityGovernance } from './Migration_004_RefreshSecurityGovernance';
import type { MigrationPostgresSecurity } from './MigrationPostgresSecurity';

export class MigrateurPostgresSecurity {
  private readonly migrations: readonly MigrationPostgresSecurity[] = [
    new Migration_001_CreateSecurityTables(),
    new Migration_002_SeedSecurityGovernance(),
    new Migration_003_UnifySecurityAudit(),
    new Migration_004_RefreshSecurityGovernance(),
  ];

  constructor(private readonly pool: Pool) {}

  public async executerToutes(): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query("SELECT pg_advisory_xact_lock(hashtext('educsyn_security_migrations'))");
      await client.query(`
        CREATE TABLE IF NOT EXISTS security_schema_migrations (
          version INTEGER PRIMARY KEY,
          nom TEXT NOT NULL,
          appliquee_le TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      for (const migration of this.migrations) {
        const appliquee = await client.query(
          'SELECT 1 FROM security_schema_migrations WHERE version = $1',
          [migration.version],
        );
        if (appliquee.rowCount) continue;
        await migration.executer(client);
        await client.query(
          'INSERT INTO security_schema_migrations (version, nom) VALUES ($1, $2)',
          [migration.version, migration.nom],
        );
      }
      await client.query('COMMIT');
    } catch (erreur) {
      await client.query('ROLLBACK');
      throw erreur;
    } finally {
      client.release();
    }
  }
}
