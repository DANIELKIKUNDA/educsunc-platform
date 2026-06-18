import { EffectiveConfigurationDto } from '../dto';
import { GetEffectiveConfigurationQuery } from '../queries';
import { EffectiveConfigurationReadModel } from '../read-models';

// Ce fichier declare le use case de lecture effective.

/** Cette classe orchestre la lecture applicative d une configuration effective. */
export class GetEffectiveConfigurationUseCase {
  constructor(private readonly readModel: EffectiveConfigurationReadModel) {}

  /** Cette methode execute la lecture effective applicative. */
  public async executer(query: GetEffectiveConfigurationQuery): Promise<EffectiveConfigurationDto | null> {
    return this.readModel.trouver(query.scope, query.keyPrefix);
  }
}
