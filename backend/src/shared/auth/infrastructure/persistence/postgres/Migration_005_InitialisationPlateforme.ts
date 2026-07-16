import type { PoolClient } from 'pg';
import type { MigrationPostgresAuth } from './MigrationPostgresAuth';

// Cette table ferme durablement le bootstrap public apres la creation du premier Manager systeme.
export class Migration_005_InitialisationPlateforme implements MigrationPostgresAuth {
  public readonly version = 5;
  public readonly nom = 'platform_first_manager_bootstrap';

  public async executer(client: PoolClient): Promise<void> {
    await client.query(`
      CREATE TABLE IF NOT EXISTS auth_initialisation_plateforme (
        singleton BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (singleton = TRUE),
        premier_utilisateur_id TEXT NOT NULL UNIQUE REFERENCES auth_utilisateurs(id_utilisateur),
        initialise_le TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0)
      )
    `);
  }
}
