import { Configuration } from '../../domain';

// Ce fichier declare le mapper de persistence principal.

/** Cette interface represente une projection technique d override persistable. */
export interface ProjectionOverridePersistenceConfiguration {
  readonly key: string;
  readonly scope: ReturnType<Configuration['details']>['scope'];
  readonly value: unknown;
  readonly actorId: string;
  readonly raison?: string;
  readonly overrideLe: Date;
}

/** Cette interface represente la projection persistable d une configuration. */
export interface ProjectionPersistenceConfiguration {
  readonly identifiant: string;
  readonly key: string;
  readonly valeur: unknown;
  readonly statut: string;
  readonly scope: ReturnType<Configuration['details']>['scope'];
  readonly gouvernance: ReturnType<Configuration['details']>['gouvernance'];
  readonly overrides: readonly ProjectionOverridePersistenceConfiguration[];
  readonly lock: ReturnType<Configuration['details']>['lock'];
  readonly totalVersions: number;
  readonly creeLe: Date;
  readonly revisionPersistence: number | null;
}

/** Cette classe transforme un agregat domaine en projection de persistence. */
export class ConfigurationPersistenceMapper {
  /** Cette methode produit une projection serialisable de configuration. */
  public versProjection(configuration: Configuration): ProjectionPersistenceConfiguration {
    const details = configuration.details();
    return {
      identifiant: details.identifiant,
      key: details.key,
      valeur: details.valeur,
      statut: details.statut,
      scope: { ...details.scope },
      gouvernance: {
        ...details.gouvernance,
        visiblePour: [...details.gouvernance.visiblePour],
      },
      overrides: details.overrides.map((override) => ({
        key: override.key.valeur(),
        scope: override.scope.valeur(),
        value: override.value.valeur(),
        actorId: override.actorId,
        raison: override.raison,
        overrideLe: override.overrideLe,
      })),
      lock: details.lock ? { ...details.lock } : null,
      totalVersions: details.totalVersions,
      creeLe: details.creeLe,
      revisionPersistence: details.revisionPersistence,
    };
  }
}
