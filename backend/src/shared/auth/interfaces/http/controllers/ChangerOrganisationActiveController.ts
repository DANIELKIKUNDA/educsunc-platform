import type { ChangerOrganisationActiveUseCase } from 'shared/auth/application/use-cases/ChangerOrganisationActiveUseCase';
import { ContexteActifPresenter } from '../presenters/ContexteActifPresenter';
import { ChangerOrganisationActiveValidator } from '../validators/ChangerOrganisationActiveValidator';

// Ce controleur change l'organisation active d'une session AUTH.
export class ChangerOrganisationActiveController {
  constructor(private readonly changerOrganisationActiveUseCase: ChangerOrganisationActiveUseCase) {}

  // Cette methode valide la commande et delegue au cas d'usage approprie.
  public async changer(corps: unknown, headers: unknown): Promise<{ donnee: unknown }> {
    const entree = ChangerOrganisationActiveValidator.valider(corps, headers);
    const sortie = await this.changerOrganisationActiveUseCase.executer(entree);
    return ContexteActifPresenter.presenter(sortie);
  }
}
