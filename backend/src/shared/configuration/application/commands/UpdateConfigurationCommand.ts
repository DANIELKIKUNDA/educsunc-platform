import { ValeurConfiguration } from '../../domain';

// Ce fichier declare la commande de mise a jour de configuration.

/** Cette interface represente les donnees necessaires a la mise a jour d une configuration. */
export interface UpdateConfigurationCommand {
  readonly configurationId: string;
  readonly value: ValeurConfiguration;
  readonly actorId?: string;
  readonly requestId?: string;
  readonly correlationId?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}
