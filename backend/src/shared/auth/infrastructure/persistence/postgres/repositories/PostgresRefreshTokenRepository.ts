import { DepotRefreshToken, RefreshToken } from '../../../../domain';
import { RefreshTokenPersistenceMapper } from '../mappers';
import { obtenirMemoireAuthStore } from './_memoireAuthStore';

// Ce depot persiste les refresh tokens AUTH.
export class PostgresRefreshTokenRepository implements DepotRefreshToken {
  private readonly store = obtenirMemoireAuthStore();

  public async sauvegarder(refreshToken: RefreshToken): Promise<void> {
    const record = RefreshTokenPersistenceMapper.versRecord(refreshToken);
    this.store.refreshTokens.set(record.id_refresh_token, record);
    this.store.refreshTokensParHash.set(record.token_hash, record.id_refresh_token);
  }

  public async trouverParHash(tokenHash: string): Promise<RefreshToken | null> {
    const idRefreshToken = this.store.refreshTokensParHash.get(String(tokenHash || '').trim());
    const record = idRefreshToken ? this.store.refreshTokens.get(idRefreshToken) : undefined;
    return record ? RefreshTokenPersistenceMapper.depuisRecord(record) : null;
  }

  public async revoquer(idRefreshToken: string): Promise<void> {
    const record = this.store.refreshTokens.get(idRefreshToken);
    if (!record) {
      return;
    }

    const refreshToken = RefreshTokenPersistenceMapper.depuisRecord(record);
    refreshToken.revoquer();
    this.store.refreshTokens.set(idRefreshToken, RefreshTokenPersistenceMapper.versRecord(refreshToken));
  }
}
