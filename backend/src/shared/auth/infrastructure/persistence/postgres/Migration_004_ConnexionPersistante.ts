import type { PoolClient } from 'pg';
import type { MigrationPostgresAuth } from './MigrationPostgresAuth';

export class Migration_004_ConnexionPersistante implements MigrationPostgresAuth {
  public readonly version = 4;
  public readonly nom = 'persistent_sessions_and_refresh_security_version';

  public async executer(client: PoolClient): Promise<void> {
    await client.query('ALTER TABLE auth_refresh_tokens ADD COLUMN IF NOT EXISTS token_version_emise INTEGER');
    await client.query(`
      UPDATE auth_refresh_tokens token
      SET token_version_emise = utilisateur.token_version
      FROM auth_utilisateurs utilisateur
      WHERE utilisateur.id_utilisateur = token.id_utilisateur
        AND token.token_version_emise IS NULL
    `);

    // Les anciennes chaines n'avaient aucune version de securite fiable a leur emission.
    await client.query(`
      UPDATE auth_refresh_tokens
      SET revoque = TRUE,
          revoque_le = COALESCE(revoque_le, NOW()),
          version = CASE WHEN revoque = FALSE THEN version + 1 ELSE version END
      WHERE revoque = FALSE
    `);
    await client.query(`
      UPDATE auth_sessions_utilisateurs
      SET revoquee_le = COALESCE(revoquee_le, NOW()),
          raison_revocation = COALESCE(raison_revocation, 'migration-securite-refresh'),
          version = CASE WHEN revoquee_le IS NULL THEN version + 1 ELSE version END
      WHERE revoquee_le IS NULL
    `);

    await client.query('ALTER TABLE auth_refresh_tokens ALTER COLUMN token_version_emise SET NOT NULL');
    await client.query(`
      ALTER TABLE auth_refresh_tokens
      ADD CONSTRAINT auth_refresh_tokens_token_version_positive
      CHECK (token_version_emise > 0) NOT VALID
    `);
    await client.query('ALTER TABLE auth_refresh_tokens VALIDATE CONSTRAINT auth_refresh_tokens_token_version_positive');

    await client.query('DROP INDEX IF EXISTS idx_auth_sessions_expiration');
    await client.query('ALTER TABLE auth_sessions_utilisateurs DROP CONSTRAINT IF EXISTS auth_sessions_expiration_coherente');
    await client.query('ALTER TABLE auth_refresh_tokens DROP CONSTRAINT IF EXISTS auth_refresh_tokens_expiration_coherente');
    await client.query('ALTER TABLE auth_sessions_utilisateurs DROP COLUMN IF EXISTS expire_le');
    await client.query('ALTER TABLE auth_refresh_tokens DROP COLUMN IF EXISTS expire_le');
  }
}
