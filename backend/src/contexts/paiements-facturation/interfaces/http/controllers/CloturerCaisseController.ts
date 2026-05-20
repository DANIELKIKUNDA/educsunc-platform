import { CloturerCaisseJourUseCase } from '../../../application/use-cases/caisse/CloturerCaisseJourUseCase';
import { CaissePresenter } from '../presenters/CaissePresenter';
import { ParamValidator } from '../validators/ParamValidator';

// Ce controleur gere la cloture HTTP d'une caisse journaliere.
export class CloturerCaisseController {
  // Ce constructeur injecte le cas d'usage de cloture.
  constructor(private readonly casUsage: CloturerCaisseJourUseCase) {}

  // Cette methode valide la requete puis presente la caisse cloturee.
  public async cloturer(corps: unknown, headers: unknown): Promise<{ donnee: unknown }> {
    const entree = ParamValidator.validerClotureCaisse(corps, headers);
    const sortie = await this.casUsage.executer(entree);

    return CaissePresenter.presenterCaisse(sortie);
  }
}
