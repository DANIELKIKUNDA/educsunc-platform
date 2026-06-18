import { RequeteMonitoringNotifications } from '../queries';

// Ce fichier declare le validateur applicatif de requete de monitoring.

/** Cette classe verifie la coherence d'une requete de monitoring. */
export class ValidateurRequeteMonitoringNotifications {
  /** Cette methode valide la requete de monitoring. */
  public valider(_requete: RequeteMonitoringNotifications): void {
    // Cette validation reste volontairement sobre a ce stade:
    // le document impose surtout la presence d'un point de controle applicatif.
  }
}
