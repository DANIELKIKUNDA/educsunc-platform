import type { ReloadRuntimeConfigurationUseCase } from '../../../../configuration/application';
import {
  envelopperReponseHttpConfiguration,
  enrichirContexteHttpConfiguration,
  extraireContexteHttpConfiguration,
} from './ConfigurationControllerSupport';
import type { ReponseControleurHttpConfiguration, RequeteHttpConfiguration } from './HttpConfigurationControllerTypes';
import { ValidateurHttpReloadConfiguration } from '../validators';

// Ce fichier declare le controller HTTP de reload runtime Configuration.

export class ControleurReloadRuntimeConfigurationHttp {
  constructor(private readonly reloadRuntimeConfigurationUseCase: ReloadRuntimeConfigurationUseCase) {}

  public async recharger(
    requete: RequeteHttpConfiguration<unknown, { id?: string }>,
  ): Promise<ReponseControleurHttpConfiguration<{ configurationId: string; reloadDemande: true }>> {
    const commenceLe = Date.now();
    const contexte = extraireContexteHttpConfiguration(requete);
    const commande = enrichirContexteHttpConfiguration(
      ValidateurHttpReloadConfiguration.valider(requete.params ?? {}, requete.body),
      contexte,
    );
    await this.reloadRuntimeConfigurationUseCase.executer(commande);
    return envelopperReponseHttpConfiguration(
      {
        configurationId: commande.configurationId,
        reloadDemande: true,
      },
      contexte,
      commenceLe,
    );
  }
}
