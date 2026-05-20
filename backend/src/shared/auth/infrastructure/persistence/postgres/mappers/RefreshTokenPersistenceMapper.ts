import { RefreshToken } from '../../../../domain';

export interface RefreshTokenRecord {
  id_refresh_token: string;
  id_utilisateur: string;
  token_hash: string;
  expire_le: string;
  revoque: boolean;
  revoque_le?: string;
  cree_le: string;
  version: number;
}

// Ce mapper convertit un refresh token AUTH entre domaine et persistance.
export class RefreshTokenPersistenceMapper {
  public static versRecord(refreshToken: RefreshToken): RefreshTokenRecord {
    return {
      id_refresh_token: refreshToken.obtenirId(),
      id_utilisateur: refreshToken.obtenirIdUtilisateur(),
      token_hash: refreshToken.obtenirTokenHash(),
      expire_le: refreshToken.obtenirExpireLe().toISOString(),
      revoque: refreshToken.obtenirRevoque(),
      revoque_le: refreshToken.obtenirRevoqueLe()?.toISOString(),
      cree_le: refreshToken.obtenirCreeLe().toISOString(),
      version: refreshToken.obtenirVersion(),
    };
  }

  public static depuisRecord(record: RefreshTokenRecord): RefreshToken {
    return new RefreshToken({
      idRefreshToken: record.id_refresh_token,
      idUtilisateur: record.id_utilisateur,
      tokenHash: record.token_hash,
      expireLe: new Date(record.expire_le),
      revoque: record.revoque,
      revoqueLe: record.revoque_le ? new Date(record.revoque_le) : undefined,
      creeLe: new Date(record.cree_le),
      version: record.version,
    });
  }
}
