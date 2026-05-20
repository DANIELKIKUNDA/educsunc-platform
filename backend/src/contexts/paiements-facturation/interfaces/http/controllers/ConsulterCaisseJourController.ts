import { ConsulterCaisseJourUseCase } from '../../../application/use-cases/caisse/ConsulterCaisseJourUseCase';
import { CaissePresenter } from '../presenters/CaissePresenter';
import { ParamValidator } from '../validators/ParamValidator';

// Ce controleur expose la consultation HTTP d'une caisse journaliere.
export class ConsulterCaisseJourController {
  // Ce constructeur injecte le cas d'usage de consultation de caisse.
  constructor(private readonly casUsage: ConsulterCaisseJourUseCase) {}

  // Cette methode valide la query HTTP puis presente la caisse demandee.
  public async consulter(query: unknown, headers: unknown): Promise<{ donnee: unknown }> {
    const entree = ParamValidator.validerConsultationCaisse(query, headers);
    const sortie = await this.casUsage.executer(entree);

    return CaissePresenter.presenterCaisse(sortie);
  }
}
