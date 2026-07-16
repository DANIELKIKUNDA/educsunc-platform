import type { PoolClient } from 'pg';
import type { MigrationPostgresAuth } from './MigrationPostgresAuth';

export class Migration_003_ExigerSessionRefreshActif implements MigrationPostgresAuth {
  public readonly version = 3;
  public readonly nom = 'require_session_for_active_refresh_tokens';

  public async executer(client: PoolClient): Promise<void> {
    await client.query(`
      UPDATE auth_refresh_tokens
      SET revoque = TRUE,
          revoque_le = COALESCE(revoque_le, NOW()),
          version = version + 1
      WHERE id_session_utilisateur IS NULL AND revoque = FALSE
    `);
    await client.query(`
      ALTER TABLE auth_refresh_tokens
      ADD CONSTRAINT auth_refresh_tokens_session_active_coherente
      CHECK (revoque = TRUE OR id_session_utilisateur IS NOT NULL) NOT VALID
    `);
    await client.query(`
      ALTER TABLE auth_refresh_tokens
      VALIDATE CONSTRAINT auth_refresh_tokens_session_active_coherente
    `);
  }
}
