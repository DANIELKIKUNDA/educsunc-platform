import { RefreshToken } from '../../../../domain';

export interface RefreshTokenRecord {
  id_refresh_token: string;
  id_utilisateur: string;
  id_session_utilisateur?: string;
  remplace_par_id?: string;
  token_hash: string;
  token_version_emise: number;
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
      id_session_utilisateur: refreshToken.obtenirIdSessionUtilisateur(),
      remplace_par_id: refreshToken.obtenirRemplaceParId(),
      token_hash: refreshToken.obtenirTokenHash(),
      token_version_emise: refreshToken.obtenirTokenVersionEmise(),
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
      idSessionUtilisateur: record.id_session_utilisateur,
      remplaceParId: record.remplace_par_id,
      tokenHash: record.token_hash,
      tokenVersionEmise: record.token_version_emise,
      revoque: record.revoque,
      revoqueLe: record.revoque_le ? new Date(record.revoque_le) : undefined,
      creeLe: new Date(record.cree_le),
      version: record.version,
    });
  }
}
