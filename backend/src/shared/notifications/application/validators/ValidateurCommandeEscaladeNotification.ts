import { CommandeEscaladerNotification } from '../commands';
import { ExceptionEscaladeHorsScope } from '../exceptions';

// Ce fichier declare le validateur applicatif d'escalade de notification.

/** Cette classe verifie les preconditions d'une escalation. */
export class ValidateurCommandeEscaladeNotification {
  /** Cette methode valide la commande d'escalade avant orchestration. */
  public valider(commande: CommandeEscaladerNotification): void {
    if (!commande.identifiantNotification.trim()) {
      throw new ExceptionEscaladeHorsScope('Une escalade exige un identifiant de notification.');
    }
    if (!commande.raison.trim()) {
      throw new ExceptionEscaladeHorsScope('Une raison d escalade est obligatoire.');
    }
  }
}
