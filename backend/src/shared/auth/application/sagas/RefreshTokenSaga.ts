import {
  DepotRefreshToken,
  DepotSessionUtilisateur,
  DepotUtilisateurAuth,
  MoteurRefreshToken,
  PolicyTokenVersion,
} from '../../domain';
import { RefreshTokenInput } from '../dto/input';
import { RefreshTokenOutput } from '../dto/output';
import { JwtTokenPort } from '../ports/crypto/JwtTokenPort';
import { TransactionManagerPort } from '../ports/transaction/TransactionManagerPort';
import { AuditAuthApplicationService } from '../services/AuditAuthApplicationService';
import { SessionCachePort } from '../ports/cache/SessionCachePort';
import { SecurityAuthorizationPort } from '../ports/security/SecurityAuthorizationPort';

// Cette saga orchestre la rotation d'un refresh token et la reemission du JWT.
export class RefreshTokenSaga {
  constructor(
    private readonly transactionManagerPort: TransactionManagerPort,
    private readonly depotRefreshToken: DepotRefreshToken,
    private readonly depotSessionUtilisateur: DepotSessionUtilisateur,
    private readonly depotUtilisateurAuth: DepotUtilisateurAuth,
    private readonly jwtTokenPort: JwtTokenPort,
    private readonly moteurRefreshToken: MoteurRefreshToken,
    private readonly sessionCachePort: SessionCachePort,
    private readonly auditAuthApplicationService?: AuditAuthApplicationService,
    private readonly securityAuthorizationPort?: SecurityAuthorizationPort,
  ) {}

  // Cette methode execute la rotation complete du refresh token.
  public async executer(input: RefreshTokenInput): Promise<RefreshTokenOutput> {
    const resultat = await this.transactionManagerPort.executerDansTransaction<RefreshTokenOutput | { erreur: unknown }>(async () => {
      const tokenHash = await this.jwtTokenPort.hacherRefreshToken(input.refreshToken);
      const refreshTokenCourant = await this.depotRefreshToken.trouverParHash(tokenHash);
      if (!refreshTokenCourant) {
        throw new Error('Refresh token invalide');
      }

      const sessionId = refreshTokenCourant.obtenirIdSessionUtilisateur();
      if (!sessionId || sessionId !== input.sessionId) {
        throw new Error('Refresh token invalide pour cette session');
      }

      const session = await this.depotSessionUtilisateur.trouverParId(sessionId);
      if (!session || session.obtenirIdUtilisateur() !== refreshTokenCourant.obtenirIdUtilisateur()) {
        throw new Error('Session de renouvellement invalide');
      }

      if (refreshTokenCourant.obtenirRevoque() && refreshTokenCourant.obtenirRemplaceParId()) {
        session.revoquer('reutilisation-refresh-token');
        await this.depotSessionUtilisateur.sauvegarder(session);
        const tokenActuel = await this.depotRefreshToken.trouverParId(session.obtenirRefreshTokenId());
        if (tokenActuel) {
          tokenActuel.revoquer();
          await this.depotRefreshToken.sauvegarder(tokenActuel);
        }
        await this.auditAuthApplicationService?.publierAuditSecurite({
          action: 'AUTH_REFRESH_REPLAY',
          utilisateurId: session.obtenirIdUtilisateur(),
          succes: false,
          details: { sessionId, actionTimestamp: new Date().toISOString() },
        });
        return { erreur: new Error('Refresh token reutilise; la session a ete revoquee') };
      }

      this.moteurRefreshToken.verifier(refreshTokenCourant);
      session.verifierValidite();
      if (session.obtenirRefreshTokenId() !== refreshTokenCourant.obtenirId()) {
        throw new Error('Refresh token remplace');
      }
      const utilisateur = await this.depotUtilisateurAuth.trouverParId(refreshTokenCourant.obtenirIdUtilisateur());
      if (!utilisateur) {
        session.revoquer('utilisateur-introuvable');
        refreshTokenCourant.revoquer();
        await this.depotSessionUtilisateur.sauvegarder(session);
        await this.depotRefreshToken.sauvegarder(refreshTokenCourant);
        return { erreur: new Error('Utilisateur auth introuvable') };
      }

      try {
        utilisateur.verifierConnexionAutorisee();
        PolicyTokenVersion.verifier(
          utilisateur.obtenirTokenVersion().obtenirValeur(),
          refreshTokenCourant.obtenirTokenVersionEmise(),
        );
      } catch (erreur) {
        session.revoquer('evenement-securite-compte');
        refreshTokenCourant.revoquer();
        await this.depotSessionUtilisateur.sauvegarder(session);
        await this.depotRefreshToken.sauvegarder(refreshTokenCourant);
        await this.auditAuthApplicationService?.publierAuditSecurite({
          action: 'AUTH_REFRESH_REVOKED',
          utilisateurId: utilisateur.obtenirId(),
          succes: false,
          details: {
            sessionId,
            raison: erreur instanceof Error ? erreur.name : 'ErreurAuthentification',
            actionTimestamp: new Date().toISOString(),
          },
        });
        return { erreur };
      }

      const tokenVersionCourante = utilisateur.obtenirTokenVersion().obtenirValeur();
      const rotation = this.moteurRefreshToken.generer(utilisateur.obtenirId(), sessionId, tokenVersionCourante);
      refreshTokenCourant.marquerRemplacement(rotation.refreshToken.obtenirId());
      session.remplacerRefreshToken(rotation.refreshToken.obtenirId());
      await this.depotRefreshToken.sauvegarder(refreshTokenCourant);
      await this.depotRefreshToken.sauvegarder(rotation.refreshToken);
      await this.depotSessionUtilisateur.sauvegarder(session);

      const roleActif = await this.securityAuthorizationPort?.resoudreRoleActif?.(
        utilisateur.obtenirId(),
      );

      const accessToken = await this.jwtTokenPort.genererJwt({
        sub: utilisateur.obtenirId(),
        sid: sessionId,
        email: utilisateur.obtenirEmail().obtenirValeur(),
        tokenVersion: tokenVersionCourante,
        organisationActiveId: session.obtenirOrganisationActiveId(),
        ecoleActiveId: session.obtenirEcoleActiveId(),
        roleActif,
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
        sessionId,
      };
    });

    await this.sessionCachePort.invaliderSession(input.sessionId);
    if ('erreur' in resultat) {
      throw resultat.erreur;
    }
    return resultat;
  }
}
