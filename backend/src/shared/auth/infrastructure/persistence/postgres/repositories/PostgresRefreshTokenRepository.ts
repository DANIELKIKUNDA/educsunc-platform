import { DepotRefreshToken, RefreshToken } from '../../../../domain';
import { RefreshTokenPersistenceMapper } from '../mappers';
import { obtenirClientPostgresAuth } from '../ClientPoolPostgresAuth';
import type { SqlQueryClient } from '../../../../../infrastructure/persistence/SqlQueryClient';

// Ce depot persiste les refresh tokens AUTH.
export class PostgresRefreshTokenRepository implements DepotRefreshToken {
  constructor(private readonly clientSql: SqlQueryClient = obtenirClientPostgresAuth()) {}

  public async sauvegarder(refreshToken: RefreshToken): Promise<void> {
    const record = RefreshTokenPersistenceMapper.versRecord(refreshToken);
    const resultat = await this.clientSql.executer(
      `INSERT INTO auth_refresh_tokens (
         id_refresh_token, id_utilisateur, id_session_utilisateur, remplace_par_id,
         token_hash, token_version_emise, revoque, revoque_le, cree_le, version
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (id_refresh_token) DO UPDATE SET
         revoque = EXCLUDED.revoque,
         revoque_le = EXCLUDED.revoque_le,
         id_session_utilisateur = EXCLUDED.id_session_utilisateur,
         remplace_par_id = EXCLUDED.remplace_par_id,
         version = EXCLUDED.version
       WHERE auth_refresh_tokens.version < EXCLUDED.version`,
      [record.id_refresh_token, record.id_utilisateur, record.id_session_utilisateur,
        record.remplace_par_id, record.token_hash, record.token_version_emise, record.revoque,
        record.revoque_le, record.cree_le, record.version],
    );
    if (resultat.nombreLignesAffectees === 0) {
      throw new Error('Conflit de version lors de la sauvegarde du refresh token.');
    }
  }

  public async trouverParHash(tokenHash: string): Promise<RefreshToken | null> {
    const resultat = await this.clientSql.executer<ReturnType<typeof RefreshTokenPersistenceMapper.versRecord>>(
      'SELECT * FROM auth_refresh_tokens WHERE token_hash = $1',
      [String(tokenHash || '').trim()],
    );
    const record = resultat.lignes[0];
    return record ? RefreshTokenPersistenceMapper.depuisRecord(record) : null;
  }

  public async trouverParId(idRefreshToken: string): Promise<RefreshToken | null> {
    const resultat = await this.clientSql.executer<ReturnType<typeof RefreshTokenPersistenceMapper.versRecord>>(
      'SELECT * FROM auth_refresh_tokens WHERE id_refresh_token = $1',
      [idRefreshToken],
    );
    const record = resultat.lignes[0];
    return record ? RefreshTokenPersistenceMapper.depuisRecord(record) : null;
  }

  public async revoquer(idRefreshToken: string): Promise<void> {
    await this.clientSql.executer(
      `UPDATE auth_refresh_tokens
       SET revoque = TRUE, revoque_le = COALESCE(revoque_le, NOW()),
           version = CASE WHEN revoque = FALSE THEN version + 1 ELSE version END
       WHERE id_refresh_token = $1`,
      [idRefreshToken],
    );
  }

  public async revoquerParUtilisateur(idUtilisateur: string): Promise<void> {
    await this.clientSql.executer(
      `UPDATE auth_refresh_tokens
       SET revoque = TRUE, revoque_le = COALESCE(revoque_le, NOW()),
           version = CASE WHEN revoque = FALSE THEN version + 1 ELSE version END
       WHERE id_utilisateur = $1 AND revoque = FALSE`,
      [idUtilisateur],
    );
  }
}
