import { Configuration } from '../../domain';
import { ConfigurationDto, ConfigurationVersionDto } from '../dto';

// Ce fichier declare le mapper applicatif principal.

/** Cette classe transforme les agregats domaine en DTO applicatifs. */
export class ConfigurationApplicationMapper {
  /** Cette methode projette un agregat Configuration en DTO applicatif. */
  public versDto(configuration: Configuration): ConfigurationDto {
    const details = configuration.details();
    return {
      identifiant: details.identifiant,
      key: details.key,
      statut: details.statut,
      scope: { ...details.scope },
      valeur: details.valeur,
      overrides: details.overrides.map((override) => ({
        scope: override.scope.valeur(),
        value: override.value.valeur(),
        actorId: override.actorId,
        raison: override.raison,
        overrideLe: override.overrideLe,
      })),
      lock: details.lock
        ? {
            niveauMinimalAutorise: details.lock.niveauMinimalAutorise,
            actorId: details.lock.actorId,
            raison: details.lock.raison,
            verrouilleLe: details.lock.verrouilleLe,
          }
        : null,
      totalVersions: details.totalVersions,
      creeLe: details.creeLe,
      gouvernance: {
        ...details.gouvernance,
        visiblePour: [...details.gouvernance.visiblePour],
      },
    };
  }

  /** Cette methode projette les versions historisees en DTO applicatifs. */
  public versVersions(configuration: Configuration): readonly ConfigurationVersionDto[] {
    return configuration.versionsHistorisees().map((version) => version.details());
  }
}
