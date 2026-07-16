import { RefreshToken } from '../aggregates/RefreshToken';
import { RefreshTokenValue } from '../value-objects/RefreshTokenValue';

export interface DependancesMoteurRefreshToken {
  genererRefreshTokenValue: () => string;
  hacherRefreshToken: (refreshTokenValue: string) => string;
}

// Ce moteur gere la generation, la verification et la revocation des refresh tokens.
export class MoteurRefreshToken {
  constructor(private readonly dependances: DependancesMoteurRefreshToken) {}

  // Cette methode cree un couple refresh token brut + token persistant.
  public generer(idUtilisateur: string, idSessionUtilisateur: string, tokenVersionEmise: number): { refreshTokenValue: RefreshTokenValue; refreshToken: RefreshToken } {
    const refreshTokenValue = new RefreshTokenValue(this.dependances.genererRefreshTokenValue());
    const refreshToken = RefreshToken.creer({
      idUtilisateur,
      idSessionUtilisateur,
      tokenHash: this.dependances.hacherRefreshToken(refreshTokenValue.obtenirValeur()),
      tokenVersionEmise,
    });
    return { refreshTokenValue, refreshToken };
  }

  // Cette methode valide un refresh token persistant avant reutilisation.
  public verifier(refreshToken: RefreshToken): void {
    refreshToken.verifierValidite();
  }

  // Cette methode revoque un refresh token deja persiste.
  public revoquer(refreshToken: RefreshToken): void {
    refreshToken.revoquer();
  }
}
