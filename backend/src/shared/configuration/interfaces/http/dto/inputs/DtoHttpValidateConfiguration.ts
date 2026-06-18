import type { PorteeConfigurationProps, ValeurConfiguration } from '../../../../domain';

// Ce fichier declare le DTO HTTP de validation de configuration.

export interface DtoHttpValidateConfiguration {
  readonly key: string;
  readonly value: ValeurConfiguration;
  readonly scope?: PorteeConfigurationProps;
}
