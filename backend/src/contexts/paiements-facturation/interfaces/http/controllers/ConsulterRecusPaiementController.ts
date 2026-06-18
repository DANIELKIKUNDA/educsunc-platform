import { ConsulterRecusPaiementUseCase } from '../../../application/use-cases/recus/ConsulterRecusPaiementUseCase';
import { RecusPaiementPresenter } from '../presenters/RecusPaiementPresenter';
import { RecusPaiementValidator } from '../validators/RecusPaiementValidator';

export class ConsulterRecusPaiementController {
  constructor(private readonly casUsage: ConsulterRecusPaiementUseCase) {}

  public async consulter(query: unknown, headers: unknown): Promise<{ donnee: unknown }> {
    const entree = RecusPaiementValidator.validerConsultation(query, headers);
    const sortie = await this.casUsage.executer(entree);
    return RecusPaiementPresenter.presenterListe(sortie);
  }
}
