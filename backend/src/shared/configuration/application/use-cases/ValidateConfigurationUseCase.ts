import {
  ConfigurationKey,
  ConfigurationValue,
  PolitiqueValidationConfiguration,
} from '../../domain';
import { ConfigurationValidationDto } from '../dto';
import { ValidateConfigurationQuery } from '../queries';

// Ce fichier declare le use case de validation.

/** Cette classe orchestre la validation applicative d une configuration. */
export class ValidateConfigurationUseCase {
  constructor(
    private readonly politiqueValidation = new PolitiqueValidationConfiguration(),
  ) {}

  /** Cette methode execute la validation applicative. */
  public async executer(query: ValidateConfigurationQuery): Promise<ConfigurationValidationDto> {
    const warnings = this.politiqueValidation.valider(
      ConfigurationKey.creer(query.key),
      ConfigurationValue.creer(query.value),
    );

    return {
      valide: warnings.length === 0,
      warnings,
    };
  }
}
