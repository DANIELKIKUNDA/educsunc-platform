import { NiveauConfiguration, PorteeConfigurationProps, ValeurConfiguration } from '../../domain';

// Ce fichier declare la commande de creation de configuration.

/** Cette interface represente les donnees necessaires a la creation d une configuration. */
export interface CreateConfigurationCommand {
  readonly configurationId?: string;
  readonly key: string;
  readonly value: ValeurConfiguration;
  readonly scope: PorteeConfigurationProps;
  readonly actorId?: string;
  readonly requestId?: string;
  readonly correlationId?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
  readonly gouvernance?: {
    readonly proprietaireNiveau?: NiveauConfiguration;
    readonly heritable?: boolean;
    readonly overridable?: boolean;
    readonly visiblePour?: readonly NiveauConfiguration[];
    readonly auditRequis?: boolean;
    readonly restartRequis?: boolean;
  };
}
