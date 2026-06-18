import type { PorteeConfigurationProps, ValeurConfiguration } from '../../../../domain';

// Ce fichier declare le DTO HTTP de creation de configuration.

export interface DtoHttpCreateConfiguration {
  readonly configurationId?: string;
  readonly key: string;
  readonly value: ValeurConfiguration;
  readonly scope: PorteeConfigurationProps;
  readonly actorId?: string;
}
