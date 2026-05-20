import { DepotRefreshToken, DepotSessionUtilisateur } from '../../domain';
import { LogoutInput } from '../dto/input';
import { SessionCachePort } from '../ports/cache/SessionCachePort';
import { TransactionManagerPort } from '../ports/transaction/TransactionManagerPort';
import { AuditAuthApplicationService } from '../services/AuditAuthApplicationService';
import { SessionIntrouvableApplicationException } from '../exceptions';

// Cette saga orchestre la revocation complete d'une session utilisateur.
export class LogoutSaga {
  constructor(
    private readonly transactionManagerPort: TransactionManagerPort,
    private readonly depotSessionUtilisateur: DepotSessionUtilisateur,
    private readonly depotRefreshToken: DepotRefreshToken,
    private readonly sessionCachePort: SessionCachePort,
    private readonly auditAuthApplicationService: AuditAuthApplicationService,
  ) {}

  // Cette methode execute l'orchestration complete d'un logout.
  public async executer(input: LogoutInput): Promise<void> {
    await this.transactionManagerPort.executerDansTransaction(async () => {
      const session = await this.depotSessionUtilisateur.trouverSessionActive(input.sessionId);
      if (!session) {
        throw new SessionIntrouvableApplicationException();
      }

      session.revoquer('logout');
      await this.depotSessionUtilisateur.sauvegarder(session);

      const refreshToken = await this.depotRefreshToken.trouverParHash(session.obtenirRefreshTokenId());
      if (refreshToken) {
        refreshToken.revoquer();
        await this.depotRefreshToken.sauvegarder(refreshToken);
      }

      await this.sessionCachePort.invaliderSession(input.sessionId);
      await this.auditAuthApplicationService.publierAuditSecurite({
        action: 'AUTH_LOGOUT',
        utilisateurId: session.obtenirIdUtilisateur(),
        succes: true,
        details: { sessionId: input.sessionId },
      });
    });
  }
}
