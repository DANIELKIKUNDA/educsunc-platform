import { RefreshToken } from '../aggregates/RefreshToken';
import { RefreshTokenValue } from '../value-objects/RefreshTokenValue';

export interface DependancesMoteurRefreshToken {
  genererRefreshTokenValue: () => string;
  hacherRefreshToken: (refreshTokenValue: string) => string;
  calculerExpirationRefreshToken?: () => Date;
}

// Ce moteur gere la generation, la verification et la revocation des refresh tokens.
export class MoteurRefreshToken {
  constructor(private readonly dependances: DependancesMoteurRefreshToken) {}

  // Cette methode cree un couple refresh token brut + token persistant.
  public generer(idUtilisateur: string): { refreshTokenValue: RefreshTokenValue; refreshToken: RefreshToken } {
    const refreshTokenValue = new RefreshTokenValue(this.dependances.genererRefreshTokenValue());
    const refreshToken = RefreshToken.creer({
      idUtilisateur,
      tokenHash: this.dependances.hacherRefreshToken(refreshTokenValue.obtenirValeur()),
      expireLe: this.dependances.calculerExpirationRefreshToken?.() ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    return { refreshTokenValue, refreshToken };
  }

  // Cette methode valide un refresh token persistant avant reutilisation.
  public verifier(refreshToken: RefreshToken, maintenant = new Date()): void {
    refreshToken.verifierExpiration(maintenant);
  }

  // Cette methode revoque un refresh token deja persiste.
  public revoquer(refreshToken: RefreshToken): void {
    refreshToken.revoquer();
  }
}
