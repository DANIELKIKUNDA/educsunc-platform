import { LockConfigurationCommand } from '../commands';
import { ExceptionConfigurationApplication } from '../exceptions';

// Ce fichier declare le validateur de verrouillage.

/** Cette classe valide les donnees minimales de verrouillage. */
export class ValidateurLockConfiguration {
  /** Cette methode valide la commande de verrouillage. */
  public valider(commande: LockConfigurationCommand): void {
    if (commande.actorId.trim().length === 0) {
      throw new ExceptionConfigurationApplication('Le verrouillage exige un actorId.');
    }
  }
}
