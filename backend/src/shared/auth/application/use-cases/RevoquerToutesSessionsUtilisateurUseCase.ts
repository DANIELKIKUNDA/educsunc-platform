import { UseCase } from '../../../application/UseCase';
import { DepotSessionUtilisateur, DepotUtilisateurAuth } from '../../domain';
import { TransactionManagerPort } from '../ports/transaction/TransactionManagerPort';
import { AuditAuthApplicationService } from '../services/AuditAuthApplicationService';

// Ce cas d'usage revoque toutes les sessions d'un utilisateur et invalide ses JWT futurs.
export class RevoquerToutesSessionsUtilisateurUseCase implements UseCase<{ utilisateurId: string }, void> {
  constructor(
    private readonly transactionManagerPort: TransactionManagerPort,
    private readonly depotUtilisateurAuth: DepotUtilisateurAuth,
    private readonly depotSessionUtilisateur: DepotSessionUtilisateur,
    private readonly auditAuthApplicationService?: AuditAuthApplicationService,
  ) {}

  public async executer(entree: { utilisateurId: string }): Promise<void> {
    await this.transactionManagerPort.executerDansTransaction(async () => {
      const utilisateur = await this.depotUtilisateurAuth.trouverParId(entree.utilisateurId);
      if (!utilisateur) {
        throw new Error('Utilisateur auth introuvable');
      }

      utilisateur.incrementerTokenVersion();
      await this.depotUtilisateurAuth.sauvegarder(utilisateur);
      await this.depotSessionUtilisateur.revoquerSessionsUtilisateur(entree.utilisateurId, 'revocation-globale');
      await this.auditAuthApplicationService?.publierAuditSecurite({
        action: 'AUTH_REVOKE_ALL_SESSIONS',
        utilisateurId: entree.utilisateurId,
        succes: true,
        details: {
          tokenVersion: utilisateur.obtenirTokenVersion().obtenirValeur(),
          actionTimestamp: new Date().toISOString(),
        },
      });
    });
  }
}
