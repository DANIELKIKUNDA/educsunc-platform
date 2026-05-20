import { ConsulterDetteEleveUseCase } from '../../../application/use-cases/dettes/ConsulterDetteEleveUseCase';
import { DetteElevePresenter } from '../presenters/DetteElevePresenter';
import { ParamValidator } from '../validators/ParamValidator';

// Ce controleur expose la dette consolidee d'un eleve sans ajouter de logique metier.
export class ConsulterDetteEleveController {
  // Ce constructeur injecte le cas d'usage de consultation de dette.
  constructor(private readonly casUsage: ConsulterDetteEleveUseCase) {}

  // Cette methode traite la lecture HTTP de la dette d'un eleve.
  public async consulter(parametres: unknown): Promise<{ donnee: unknown }> {
    const entree = ParamValidator.validerDetteEleve(parametres);
    const sortie = await this.casUsage.executer(entree);

    return DetteElevePresenter.presenterDetteEleve(sortie);
  }
}
