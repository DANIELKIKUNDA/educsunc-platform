import type { ValeurConfiguration } from '../../../../domain';

// Ce fichier declare le DTO HTTP de mise a jour de configuration.

export interface DtoHttpUpdateConfiguration {
  readonly value: ValeurConfiguration;
  readonly actorId?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}
