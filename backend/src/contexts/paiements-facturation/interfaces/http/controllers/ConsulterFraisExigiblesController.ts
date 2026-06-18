import { ConsulterFraisExigiblesEleveUseCase } from '../../../application/use-cases/dettes/ConsulterFraisExigiblesEleveUseCase';
import { FraisExigiblesPresenter } from '../presenters/FraisExigiblesPresenter';
import { ParamValidator } from '../validators/ParamValidator';

// Ce controleur expose les frais actuellement payables d'un eleve.
export class ConsulterFraisExigiblesController {
  // Ce constructeur injecte le cas d'usage de lecture des frais exigibles.
  constructor(private readonly casUsage: ConsulterFraisExigiblesEleveUseCase) {}

  // Cette methode valide le parametre eleve puis presente la liste des frais.
  public async consulter(parametres: unknown, headers: unknown): Promise<{ donnee: unknown }> {
    const entree = ParamValidator.validerFraisExigiblesAvecContexte(parametres, headers);
    const sortie = await this.casUsage.executer(entree);

    return FraisExigiblesPresenter.presenterFraisExigibles(sortie);
  }
}
