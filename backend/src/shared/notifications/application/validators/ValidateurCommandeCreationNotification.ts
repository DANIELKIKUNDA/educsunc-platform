import { CommandeCreerNotification } from '../commands';
import { ExceptionPayloadInvalideNotification } from '../exceptions';

// Ce fichier declare le validateur applicatif de creation de notification.

/** Cette classe verifie les preconditions d'orchestration d'une creation. */
export class ValidateurCommandeCreationNotification {
  /** Cette methode valide la coherence applicative minimale de la commande. */
  public valider(commande: CommandeCreerNotification): void {
    if (!commande.message.trim()) {
      throw new ExceptionPayloadInvalideNotification('Le message de notification est obligatoire.');
    }
    if (commande.canaux.length === 0) {
      throw new ExceptionPayloadInvalideNotification('Au moins un canal doit etre precise.');
    }
    if (commande.destinataires.length === 0) {
      throw new ExceptionPayloadInvalideNotification('Au moins un destinataire doit etre precise.');
    }
  }
}
