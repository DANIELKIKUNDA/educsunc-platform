import type { ConfigurationDto } from '../../../../configuration/application';

// Ce fichier declare le presentateur HTTP principal de Configuration.

export class PresentateurHttpConfiguration {
  public static presenter(configuration: ConfigurationDto): ConfigurationDto {
    return configuration;
  }
}
