import { RefreshTokenOutput } from '../dto/output';

// Ce mapper standardise la sortie applicative des rotations de refresh token.
export class RefreshTokenMapper {
  public static versSortie(accessToken: string, refreshToken: string, sessionId: string): RefreshTokenOutput {
    return { accessToken, refreshToken, sessionId };
  }
}
