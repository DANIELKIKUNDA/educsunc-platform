import type { PorteeConfigurationProps, ValeurConfiguration } from '../../../../domain';

// Ce fichier declare le DTO HTTP d override de configuration.

export interface DtoHttpOverrideConfiguration {
  readonly scope: PorteeConfigurationProps;
  readonly value: ValeurConfiguration;
  readonly actorId: string;
  readonly raison?: string;
}
