import { DepotContexteActifAuth, DepotSessionUtilisateur, DepotUtilisateurAuth, MoteurOfflineAuth } from '../../domain';
import { AuthOfflineInput } from '../dto/input';
import { OfflineAuthPort } from '../ports/offline/OfflineAuthPort';
import { TransactionManagerPort } from '../ports/transaction/TransactionManagerPort';
import { AuditAuthApplicationService } from '../services/AuditAuthApplicationService';

// Cette saga orchestre l'authentification offline et sa reprise de synchronisation.
export class OfflineAuthenticationSaga {
  constructor(
    private readonly transactionManagerPort: TransactionManagerPort,
    private readonly depotUtilisateurAuth: DepotUtilisateurAuth,
    private readonly depotSessionUtilisateur: DepotSessionUtilisateur,
    private readonly depotContexteActifAuth: DepotContexteActifAuth,
    private readonly offlineAuthPort: OfflineAuthPort,
    private readonly auditAuthApplicationService: AuditAuthApplicationService,
    private readonly moteurOfflineAuth: MoteurOfflineAuth,
  ) {}

  // Cette methode execute la preparation ou la reprise d'une authentification offline.
  public async executer(input: AuthOfflineInput): Promise<void> {
    await this.transactionManagerPort.executerDansTransaction(async () => {
      const utilisateur = await this.depotUtilisateurAuth.trouverParId(input.utilisateurId);
      if (!utilisateur) {
        throw new Error('Utilisateur auth introuvable');
      }

      this.moteurOfflineAuth.verifierAuthentificationOffline(utilisateur);

      const contexte = await this.depotContexteActifAuth.trouverContexteUtilisateur(utilisateur.obtenirId());
      const sessions = await this.depotSessionUtilisateur.trouverSessionActive(input.utilisateurId);
      if (!contexte || !sessions) {
        await this.offlineAuthPort.stockerAuthLocale({
          utilisateurId: input.utilisateurId,
          deviceId: input.deviceId,
          payload: { statut: 'offline-ready' },
        });
      } else {
        const synchronisation = this.moteurOfflineAuth.preparerSynchronisation(sessions, contexte);
        await this.offlineAuthPort.stockerAuthLocale({
          utilisateurId: input.utilisateurId,
          deviceId: input.deviceId,
          payload: synchronisation,
        });
      }

      await this.auditAuthApplicationService.publierAuditSecurite({
        action: 'AUTH_OFFLINE_PREPAREE',
        utilisateurId: input.utilisateurId,
        succes: true,
        details: { deviceId: input.deviceId },
      });
    });
  }
}
