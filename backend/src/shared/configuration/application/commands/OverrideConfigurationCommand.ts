import { PorteeConfigurationProps, ValeurConfiguration } from '../../domain';

// Ce fichier declare la commande d override de configuration.

/** Cette interface represente les donnees necessaires a une surcharge gouvernee. */
export interface OverrideConfigurationCommand {
  readonly configurationId: string;
  readonly scope: PorteeConfigurationProps;
  readonly value: ValeurConfiguration;
  readonly actorId: string;
  readonly raison?: string;
}
