import type { PropagateConfigurationUseCase } from '../../../../configuration/application';
import {
  envelopperReponseHttpConfiguration,
  enrichirContexteHttpConfiguration,
  extraireContexteHttpConfiguration,
} from './ConfigurationControllerSupport';
import type { ReponseControleurHttpConfiguration, RequeteHttpConfiguration } from './HttpConfigurationControllerTypes';
import { ValidateurHttpPropagationConfiguration } from '../validators';

// Ce fichier declare le controller HTTP de propagation Configuration.

export class ControleurPropagationConfigurationHttp {
  constructor(private readonly propagateConfigurationUseCase: PropagateConfigurationUseCase) {}

  public async propager(
    requete: RequeteHttpConfiguration<unknown, { id?: string }>,
  ): Promise<ReponseControleurHttpConfiguration<{ configurationId: string; propagationDemandee: true }>> {
    const commenceLe = Date.now();
    const contexte = extraireContexteHttpConfiguration(requete);
    const commande = enrichirContexteHttpConfiguration(
      ValidateurHttpPropagationConfiguration.valider(requete.params ?? {}, requete.body),
      contexte,
    );
    await this.propagateConfigurationUseCase.executer(commande);
    return envelopperReponseHttpConfiguration(
      {
        configurationId: commande.configurationId,
        propagationDemandee: true,
      },
      contexte,
      commenceLe,
    );
  }
}
