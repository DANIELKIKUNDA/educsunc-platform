import { RequeteListerNotifications } from '../queries';
import { ExceptionPayloadInvalideNotification } from '../exceptions';

// Ce fichier declare le validateur applicatif de requete liste.

/** Cette classe verifie les bornes de pagination et de recherche. */
export class ValidateurRequeteListeNotifications {
  /** Cette methode valide les bornes minimales de pagination. */
  public valider(requete: RequeteListerNotifications): void {
    if (requete.page < 1 || requete.taillePage < 1) {
      throw new ExceptionPayloadInvalideNotification('La pagination doit etre strictement positive.');
    }
  }
}
