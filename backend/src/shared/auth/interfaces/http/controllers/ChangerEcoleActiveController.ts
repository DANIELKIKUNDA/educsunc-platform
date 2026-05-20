import type { ChangerEcoleActiveUseCase } from 'shared/auth/application/use-cases/ChangerEcoleActiveUseCase';
import { ContexteActifPresenter } from '../presenters/ContexteActifPresenter';
import { ChangerEcoleActiveValidator } from '../validators/ChangerEcoleActiveValidator';

// Ce controleur change l'ecole active de la session AUTH courante.
export class ChangerEcoleActiveController {
  constructor(private readonly changerEcoleActiveUseCase: ChangerEcoleActiveUseCase) {}

  // Cette methode valide la commande et renvoie le nouveau contexte actif.
  public async changer(corps: unknown, headers: unknown): Promise<{ donnee: unknown }> {
    const entree = ChangerEcoleActiveValidator.valider(corps, headers);
    const sortie = await this.changerEcoleActiveUseCase.executer(entree);
    return ContexteActifPresenter.presenter(sortie);
  }
}
