import { CommandeRejouerNotification } from '../commands';
import { ExceptionRejeuNonAutorise } from '../exceptions';

// Ce fichier declare le validateur applicatif de rejeu de notification.

/** Cette classe verifie les preconditions d'un rejeu technique. */
export class ValidateurCommandeRejeuNotification {
  /** Cette methode valide la commande de rejeu avant orchestration. */
  public valider(commande: CommandeRejouerNotification): void {
    if (!commande.identifiantNotification.trim()) {
      throw new ExceptionRejeuNonAutorise('Le rejeu exige un identifiant de notification.');
    }
    if (!commande.raison.trim()) {
      throw new ExceptionRejeuNonAutorise('Une raison de rejeu est obligatoire.');
    }
  }
}
