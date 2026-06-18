import { CommandeAccuserReceptionNotification } from '../commands';
import { ExceptionPayloadInvalideNotification } from '../exceptions';

// Ce fichier declare le validateur applicatif d'accuse de reception.

/** Cette classe verifie les preconditions d'un accuse de reception. */
export class ValidateurCommandeAccuseReceptionNotification {
  /** Cette methode valide la commande d'accuse de reception. */
  public valider(commande: CommandeAccuserReceptionNotification): void {
    if (!commande.identifiantNotification.trim() || !commande.destinataireId.trim()) {
      throw new ExceptionPayloadInvalideNotification(
        'L identifiant de notification et le destinataire sont obligatoires.',
      );
    }
  }
}
