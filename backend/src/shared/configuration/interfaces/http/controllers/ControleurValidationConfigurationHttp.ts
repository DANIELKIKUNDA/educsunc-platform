import type { ValidateConfigurationUseCase } from '../../../../configuration/application';
import {
  envelopperReponseHttpConfiguration,
  extraireContexteHttpConfiguration,
} from './ConfigurationControllerSupport';
import type { ReponseControleurHttpConfiguration, RequeteHttpConfiguration } from './HttpConfigurationControllerTypes';
import { PresentateurHttpValidationConfiguration } from '../presenters';
import { ValidateurHttpValidateConfiguration } from '../validators';

// Ce fichier declare le controller HTTP de validation Configuration.

export class ControleurValidationConfigurationHttp {
  constructor(private readonly validateConfigurationUseCase: ValidateConfigurationUseCase) {}

  public async valider(
    requete: RequeteHttpConfiguration<unknown>,
  ): Promise<ReponseControleurHttpConfiguration<ReturnType<typeof PresentateurHttpValidationConfiguration.presenter>>> {
    const commenceLe = Date.now();
    const contexte = extraireContexteHttpConfiguration(requete);
    const query = ValidateurHttpValidateConfiguration.valider(requete.body);
    const resultat = await this.validateConfigurationUseCase.executer(query);
    return envelopperReponseHttpConfiguration(
      PresentateurHttpValidationConfiguration.presenter(resultat),
      contexte,
      commenceLe,
    );
  }
}
