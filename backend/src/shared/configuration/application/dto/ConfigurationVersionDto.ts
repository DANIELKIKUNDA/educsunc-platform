import { ValeurConfiguration } from '../../domain';

// Ce fichier declare le DTO de version.

/** Cette interface represente une version historisee de configuration. */
export interface ConfigurationVersionDto {
  readonly configurationId: string;
  readonly numeroVersion: number;
  readonly valeur: ValeurConfiguration;
  readonly changement: {
    readonly type: string;
    readonly actorId?: string;
    readonly requestId?: string;
    readonly correlationId?: string;
    readonly changedAt: Date;
    readonly metadata: Readonly<Record<string, unknown>>;
  };
  readonly creeLe: Date;
}
