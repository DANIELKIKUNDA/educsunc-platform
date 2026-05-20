import { ContexteActifOutput } from '../dto/output';
import { ContexteActifApplicationService } from '../services/ContexteActifApplicationService';
import { TransactionManagerPort } from '../ports/transaction/TransactionManagerPort';

// Cette saga orchestre les changements de contexte actif utilisateur.
export class ChangerContexteActifSaga {
  constructor(
    private readonly transactionManagerPort: TransactionManagerPort,
    private readonly contexteActifApplicationService: ContexteActifApplicationService,
  ) {}

  // Cette methode change l'organisation active dans une transaction applicative.
  public async changerOrganisationActive(idUtilisateur: string, organisationActiveId: string): Promise<ContexteActifOutput> {
    return this.transactionManagerPort.executerDansTransaction(() =>
      this.contexteActifApplicationService.changerOrganisationActive(idUtilisateur, organisationActiveId),
    );
  }

  // Cette methode change l'ecole active dans une transaction applicative.
  public async changerEcoleActive(idUtilisateur: string, ecoleActiveId: string): Promise<ContexteActifOutput> {
    return this.transactionManagerPort.executerDansTransaction(() =>
      this.contexteActifApplicationService.changerEcoleActive(idUtilisateur, ecoleActiveId),
    );
  }
}
