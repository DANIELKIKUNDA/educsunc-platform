import { ConsulterArrieresEleveUseCase } from '../../../application/use-cases/dettes/ConsulterArrieresEleveUseCase';
import { ArrieresElevePresenter } from '../presenters/ArrieresElevePresenter';
import { ParamValidator } from '../validators/ParamValidator';

export class ConsulterArrieresEleveController {
  constructor(private readonly casUsage: ConsulterArrieresEleveUseCase) {}

  public async consulter(parametres: unknown, headers: unknown): Promise<{ donnee: unknown }> {
    const entree = ParamValidator.validerArrieresEleveAvecContexte(parametres, headers);
    const sortie = await this.casUsage.executer(entree);

    return ArrieresElevePresenter.presenterArrieres(sortie);
  }
}
