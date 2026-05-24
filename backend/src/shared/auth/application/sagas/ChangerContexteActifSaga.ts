import { ContexteActifOutput } from '../dto/output';
import { ContexteActifApplicationService } from '../services/ContexteActifApplicationService';
import { TransactionManagerPort } from '../ports/transaction/TransactionManagerPort';
import { AuditAuthApplicationService } from '../services/AuditAuthApplicationService';

// Cette saga orchestre les changements de contexte actif utilisateur.
export class ChangerContexteActifSaga {
  constructor(
    private readonly transactionManagerPort: TransactionManagerPort,
    private readonly contexteActifApplicationService: ContexteActifApplicationService,
    private readonly auditAuthApplicationService?: AuditAuthApplicationService,
  ) {}

  // Cette methode change l'organisation active dans une transaction applicative.
  public async changerOrganisationActive(idUtilisateur: string, organisationActiveId: string): Promise<ContexteActifOutput> {
    return this.transactionManagerPort.executerDansTransaction(async () => {
      const sortie = await this.contexteActifApplicationService.changerOrganisationActive(idUtilisateur, organisationActiveId);
      await this.auditAuthApplicationService?.publierAuditSecurite({
        action: 'AUTH_CONTEXT_CHANGED',
        utilisateurId: idUtilisateur,
        succes: true,
        details: {
          organisationActiveId: sortie.organisationActiveId,
          ecoleActiveId: sortie.ecoleActiveId,
          actionTimestamp: new Date().toISOString(),
        },
      });
      return sortie;
    });
  }

  // Cette methode change l'ecole active dans une transaction applicative.
  public async changerEcoleActive(idUtilisateur: string, ecoleActiveId: string): Promise<ContexteActifOutput> {
    return this.transactionManagerPort.executerDansTransaction(async () => {
      const sortie = await this.contexteActifApplicationService.changerEcoleActive(idUtilisateur, ecoleActiveId);
      await this.auditAuthApplicationService?.publierAuditSecurite({
        action: 'AUTH_CONTEXT_CHANGED',
        utilisateurId: idUtilisateur,
        succes: true,
        details: {
          organisationActiveId: sortie.organisationActiveId,
          ecoleActiveId: sortie.ecoleActiveId,
          actionTimestamp: new Date().toISOString(),
        },
      });
      return sortie;
    });
  }
}
