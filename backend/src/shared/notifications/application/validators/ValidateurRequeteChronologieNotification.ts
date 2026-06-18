import { RequeteChronologieNotification } from '../queries';
import { ExceptionPayloadInvalideNotification } from '../exceptions';

// Ce fichier declare le validateur applicatif de requete de chronologie.

/** Cette classe verifie les preconditions de lecture de chronologie. */
export class ValidateurRequeteChronologieNotification {
  /** Cette methode valide la requete de chronologie. */
  public valider(requete: RequeteChronologieNotification): void {
    if (!requete.identifiantNotification.trim()) {
      throw new ExceptionPayloadInvalideNotification('La chronologie exige un identifiant de notification.');
    }
  }
}
