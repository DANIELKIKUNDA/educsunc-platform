import { EffectiveConfiguration } from '../../domain';
import { EffectiveConfigurationDto } from '../dto';

// Ce fichier declare le mapper de configuration effective.

/** Cette classe transforme la lecture domaine effective en DTO applicatif. */
export class EffectiveConfigurationMapper {
  /** Cette methode projette une configuration effective resolue. */
  public versDto(configuration: EffectiveConfiguration): EffectiveConfigurationDto {
    const details = configuration.details();
    return {
      scope: details.scope,
      valeurs: details.valeurs.map((valeur) => ({
        key: valeur.key.valeur(),
        value: valeur.value.valeur(),
        sourceNiveau: valeur.sourceNiveau,
        herite: valeur.herite,
        verrouille: valeur.verrouille,
        explanation: valeur.explanation,
        sourceConfigurationId: valeur.sourceConfigurationId,
        sourceStatut: valeur.sourceStatut,
        sourceTotalVersions: valeur.sourceTotalVersions,
        sourceCreeLe: valeur.sourceCreeLe,
      })),
    };
  }
}
