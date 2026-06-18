import type { ConfigurationValidationDto } from '../../../../configuration/application';

// Ce fichier declare le presentateur HTTP de validation.

export class PresentateurHttpValidationConfiguration {
  public static presenter(resultat: ConfigurationValidationDto): ConfigurationValidationDto {
    return resultat;
  }
}
