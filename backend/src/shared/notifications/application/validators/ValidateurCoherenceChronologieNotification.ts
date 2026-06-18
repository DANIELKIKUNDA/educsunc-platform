import { ModeleLectureChronologieNotification } from '../read-models';
import { ExceptionPayloadInvalideNotification } from '../exceptions';

// Ce fichier declare le validateur applicatif de coherence de chronologie.

/** Cette classe verifie l'ordre temporel minimal de la chronologie projetee. */
export class ValidateurCoherenceChronologieNotification {
  /** Cette methode s'assure que les evenements sont ordonnes de maniere non destructrice. */
  public valider(modele: ModeleLectureChronologieNotification): void {
    for (let index = 1; index < modele.elements.length; index += 1) {
      if (modele.elements[index - 1].horodatage.getTime() > modele.elements[index].horodatage.getTime()) {
        throw new ExceptionPayloadInvalideNotification(
          'La chronologie projetee de la notification n est pas ordonnee.',
        );
      }
    }
  }
}
