import { ConfigurationSnapshot } from '../../domain';
import { ConfigurationSnapshotDto } from '../dto';

// Ce fichier declare le mapper de snapshots.

/** Cette classe transforme les snapshots domaine en DTO applicatifs. */
export class ConfigurationSnapshotMapper {
  /** Cette methode projette un snapshot domaine. */
  public versDto(snapshot: ConfigurationSnapshot): ConfigurationSnapshotDto {
    const details = snapshot.details();
    return {
      identifiantSnapshot: details.identifiantSnapshot,
      creeLe: details.creeLe,
      valeurs: details.valeurs.map((valeur) => ({
        key: valeur.key.valeur(),
        value: valeur.value.valeur(),
        sourceNiveau: valeur.sourceNiveau,
        herite: valeur.herite,
        verrouille: valeur.verrouille,
        explanation: valeur.explanation,
      })),
    };
  }
}
