import type { Pool } from 'pg';

import { Migration_001_CreateAuthTables } from './Migration_001_CreateAuthTables';
import { Migration_002_DurcirJetonsSessions } from './Migration_002_DurcirJetonsSessions';
import { Migration_003_ExigerSessionRefreshActif } from './Migration_003_ExigerSessionRefreshActif';
import { Migration_004_ConnexionPersistante } from './Migration_004_ConnexionPersistante';
import { Migration_005_InitialisationPlateforme } from './Migration_005_InitialisationPlateforme';
import type { MigrationPostgresAuth } from './MigrationPostgresAuth';

export class MigrateurPostgresAuth {
  private readonly migrations: readonly MigrationPostgresAuth[] = [
    new Migration_001_CreateAuthTables(),
    new Migration_002_DurcirJetonsSessions(),
    new Migration_003_ExigerSessionRefreshActif(),
    new Migration_004_ConnexionPersistante(),
    new Migration_005_InitialisationPlateforme(),
  ];

  constructor(private readonly pool: Pool) {}

  public async executerToutes(): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query("SELECT pg_advisory_xact_lock(hashtext('educsyn_auth_migrations'))");
      await client.query(`
        CREATE TABLE IF NOT EXISTS auth_schema_migrations (
          version INTEGER PRIMARY KEY,
          nom TEXT NOT NULL,
          appliquee_le TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);

      for (const migration of this.migrations) {
        const appliquee = await client.query(
          'SELECT 1 FROM auth_schema_migrations WHERE version = $1',
          [migration.version],
        );
        if (appliquee.rowCount) {
          continue;
        }
        await migration.executer(client);
        await client.query(
          'INSERT INTO auth_schema_migrations (version, nom) VALUES ($1, $2)',
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
