import { OuvrirCaisseJourUseCase } from '../../../application/use-cases/caisse/OuvrirCaisseJourUseCase';
import { CaissePresenter } from '../presenters/CaissePresenter';
import { ParamValidator } from '../validators/ParamValidator';

// Ce controleur gere l'ouverture HTTP d'une caisse journaliere.
export class OuvrirCaisseController {
  // Ce constructeur injecte le cas d'usage d'ouverture de caisse.
  constructor(private readonly casUsage: OuvrirCaisseJourUseCase) {}

  // Cette methode valide le corps HTTP puis presente la caisse ouverte.
  public async ouvrir(corps: unknown, headers: unknown): Promise<{ donnee: unknown }> {
    const entree = ParamValidator.validerOuvertureCaisse(corps, headers);
    const sortie = await this.casUsage.executer(entree);

    return CaissePresenter.presenterCaisse(sortie);
  }
}
