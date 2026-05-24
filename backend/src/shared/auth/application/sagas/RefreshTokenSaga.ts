import { DepotRefreshToken, DepotUtilisateurAuth, MoteurRefreshToken, PolicyTokenVersion } from '../../domain';
import { RefreshTokenInput } from '../dto/input';
import { RefreshTokenOutput } from '../dto/output';
import { JwtTokenPort } from '../ports/crypto/JwtTokenPort';
import { TransactionManagerPort } from '../ports/transaction/TransactionManagerPort';
import { AuditAuthApplicationService } from '../services/AuditAuthApplicationService';

// Cette saga orchestre la rotation d'un refresh token et la reemission du JWT.
export class RefreshTokenSaga {
  constructor(
    private readonly transactionManagerPort: TransactionManagerPort,
    private readonly depotRefreshToken: DepotRefreshToken,
    private readonly depotUtilisateurAuth: DepotUtilisateurAuth,
    private readonly jwtTokenPort: JwtTokenPort,
    private readonly moteurRefreshToken: MoteurRefreshToken,
    private readonly auditAuthApplicationService?: AuditAuthApplicationService,
  ) {}

  // Cette methode execute la rotation complete du refresh token.
  public async executer(input: RefreshTokenInput): Promise<RefreshTokenOutput> {
    return this.transactionManagerPort.executerDansTransaction(async () => {
      const tokenHash = await this.jwtTokenPort.hacherRefreshToken(input.refreshToken);
      const refreshTokenCourant = await this.depotRefreshToken.trouverParHash(tokenHash);
      if (!refreshTokenCourant) {
        throw new Error('Refresh token invalide');
      }

      this.moteurRefreshToken.verifier(refreshTokenCourant);
      const utilisateur = await this.depotUtilisateurAuth.trouverParId(refreshTokenCourant.obtenirIdUtilisateur());
      if (!utilisateur) {
        throw new Error('Utilisateur auth introuvable');
      }

      PolicyTokenVersion.verifier(utilisateur.obtenirTokenVersion().obtenirValeur(), utilisateur.obtenirTokenVersion().obtenirValeur());

      refreshTokenCourant.revoquer();
      await this.depotRefreshToken.sauvegarder(refreshTokenCourant);

      const rotation = this.moteurRefreshToken.generer(utilisateur.obtenirId());
      await this.depotRefreshToken.sauvegarder(rotation.refreshToken);

      const accessToken = await this.jwtTokenPort.genererJwt({
        sub: utilisateur.obtenirId(),
        email: utilisateur.obtenirEmail().obtenirValeur(),
        tokenVersion: utilisateur.obtenirTokenVersion().obtenirValeur(),
      });

      await this.auditAuthApplicationService?.publierAuditSecurite({
        action: 'AUTH_REFRESH',
        utilisateurId: utilisateur.obtenirId(),
        succes: true,
        details: {
          refreshTokenId: refreshTokenCourant.obtenirId(),
          actionTimestamp: new Date().toISOString(),
        },
      });

      return {
        accessToken,
        refreshToken: rotation.refreshTokenValue.obtenirValeur(),
      };
    });
  }
}
