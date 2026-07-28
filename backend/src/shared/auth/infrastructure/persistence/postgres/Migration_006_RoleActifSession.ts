import type { PoolClient } from 'pg';
import type { MigrationPostgresAuth } from './MigrationPostgresAuth';

// Le role de travail appartient a la session afin de ne jamais changer
// silencieusement lors d'une rotation de jeton ou sur un autre appareil.
export class Migration_006_RoleActifSession implements MigrationPostgresAuth {
  public readonly version = 6;
  public readonly nom = 'active_role_per_session';

  public async executer(client: PoolClient): Promise<void> {
    await client.query(`
      ALTER TABLE auth_sessions_utilisateurs
      ADD COLUMN IF NOT EXISTS role_actif TEXT
    `);
  }
}
