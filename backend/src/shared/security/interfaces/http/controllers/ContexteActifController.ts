import type {
  ChangerEcoleActiveUseCase,
  ChangerOrganisationActiveUseCase,
  ObtenirContexteActifUseCase,
} from 'shared/security/application';
import { ChangerEcoleActiveValidator, ChangerOrganisationActiveValidator } from '../validators';
import { ContexteActifPresenter } from '../presenters/ContexteActifPresenter';

// Ce controleur orchestre les endpoints HTTP du contexte actif SECURITY.
export class ContexteActifController {
  constructor(
    private readonly changerOrganisationActiveUseCase: ChangerOrganisationActiveUseCase,
    private readonly changerEcoleActiveUseCase: ChangerEcoleActiveUseCase,
    private readonly obtenirContexteActifUseCase: ObtenirContexteActifUseCase,
  ) {}

  public async changerOrganisation(corps: unknown): Promise<{ donnee: unknown }> {
    const sortie = await this.changerOrganisationActiveUseCase.executer(ChangerOrganisationActiveValidator.valider(corps));
    return ContexteActifPresenter.presenter(sortie);
  }

  public async changerEcole(corps: unknown): Promise<{ donnee: unknown }> {
    const sortie = await this.changerEcoleActiveUseCase.executer(ChangerEcoleActiveValidator.valider(corps));
    return ContexteActifPresenter.presenter(sortie);
  }

  public async obtenir(idUtilisateur: string): Promise<{ donnee: unknown }> {
    const sortie = await this.obtenirContexteActifUseCase.executer({ idUtilisateur });
    return ContexteActifPresenter.presenter(sortie);
  }
}
