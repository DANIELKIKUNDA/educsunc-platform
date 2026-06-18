import { CommandeControlerRetryNotification } from '../commands';
import { ExceptionPayloadInvalideNotification } from '../exceptions';

// Ce fichier declare le validateur applicatif de controle de retry.

/** Cette classe verifie les preconditions d'un workflow de retry. */
export class ValidateurCommandeRetryNotification {
  /** Cette methode valide la commande de retry avant orchestration. */
  public valider(commande: CommandeControlerRetryNotification): void {
    if (!commande.identifiantNotification.trim()) {
      throw new ExceptionPayloadInvalideNotification('Le retry exige un identifiant de notification.');
    }
    if (!commande.raison.trim()) {
      throw new ExceptionPayloadInvalideNotification('Une raison de retry est obligatoire.');
    }
  }
}
