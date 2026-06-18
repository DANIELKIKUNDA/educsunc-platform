import { PropagateConfigurationCommand } from '../commands';
import { ExceptionConfigurationIntrouvable } from '../exceptions';
import { ConfigurationReadModel } from '../read-models';
import { ServiceApplicationPropagationConfiguration } from '../services';

// Ce fichier declare le use case de propagation.

/** Cette classe orchestre la propagation applicative d une configuration. */
export class PropagateConfigurationUseCase {
  constructor(
    private readonly readModel: ConfigurationReadModel,
    private readonly servicePropagation: ServiceApplicationPropagationConfiguration,
  ) {}

  /** Cette methode execute la propagation applicative d une configuration. */
  public async executer(commande: PropagateConfigurationCommand): Promise<void> {
    const configuration = await this.readModel.trouverParId(commande.configurationId);
    if (!configuration) {
      throw new ExceptionConfigurationIntrouvable(commande.configurationId);
    }

    await this.servicePropagation.propager(commande.configurationId, commande.canauxCibles);
  }
}
