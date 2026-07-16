import type { PoolClient } from 'pg';
import type { MigrationPostgresAuth } from './MigrationPostgresAuth';

export class Migration_002_DurcirJetonsSessions implements MigrationPostgresAuth {
  public readonly version = 2;
  public readonly nom = 'harden_tokens_and_sessions';

  public async executer(client: PoolClient): Promise<void> {
    await client.query('ALTER TABLE auth_refresh_tokens ADD COLUMN IF NOT EXISTS id_session_utilisateur TEXT');
    await client.query('ALTER TABLE auth_refresh_tokens ADD COLUMN IF NOT EXISTS remplace_par_id TEXT');
    await client.query(`
      UPDATE auth_refresh_tokens token
      SET id_session_utilisateur = session.id_session_utilisateur
      FROM auth_sessions_utilisateurs session
      WHERE session.refresh_token_id = token.id_refresh_token
        AND token.id_session_utilisateur IS NULL
    `);
    await client.query('CREATE INDEX IF NOT EXISTS idx_auth_refresh_tokens_session ON auth_refresh_tokens (id_session_utilisateur, revoque)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_auth_refresh_tokens_remplacement ON auth_refresh_tokens (remplace_par_id) WHERE remplace_par_id IS NOT NULL');
  }
}
