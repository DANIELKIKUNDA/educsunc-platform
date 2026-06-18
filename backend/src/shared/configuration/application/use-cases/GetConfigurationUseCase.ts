import { ConfigurationDto } from '../dto';
import { ExceptionConfigurationIntrouvable } from '../exceptions';
import { GetConfigurationQuery } from '../queries';
import { ConfigurationReadModel } from '../read-models';

// Ce fichier declare le use case de lecture de configuration.

/** Cette classe orchestre la lecture applicative d une configuration. */
export class GetConfigurationUseCase {
  constructor(private readonly readModel: ConfigurationReadModel) {}

  /** Cette methode execute la lecture applicative d une configuration. */
  public async executer(query: GetConfigurationQuery): Promise<ConfigurationDto> {
    const configuration = await this.readModel.trouverParId(query.configurationId);
    if (!configuration) {
      throw new ExceptionConfigurationIntrouvable(query.configurationId);
    }

    return configuration;
  }
}
