import { RestituerExcedentUseCase } from '../../../application/use-cases/annulations/RestituerExcedentUseCase';
import { RestitutionPresenter } from '../presenters/RestitutionPresenter';
import { RestituerExcedentValidator } from '../validators/RestituerExcedentValidator';

// Ce controleur gere la restitution HTTP d'un excedent de paiement.
export class RestituerExcedentController {
  // Ce constructeur injecte le cas d'usage de restitution.
  constructor(private readonly casUsage: RestituerExcedentUseCase) {}

  // Cette methode valide le corps HTTP puis presente la restitution produite.
  public async restituer(corps: unknown, headers: unknown): Promise<{ donnee: unknown }> {
    const entree = RestituerExcedentValidator.valider(corps, headers);
    const sortie = await this.casUsage.executer(entree);

    return RestitutionPresenter.presenterRestitution(sortie);
  }
}
