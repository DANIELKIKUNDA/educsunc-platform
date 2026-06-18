import { OverrideConfigurationCommand } from '../commands';
import { ExceptionConfigurationApplication } from '../exceptions';

// Ce fichier declare le validateur d override.

/** Cette classe valide les donnees minimales d une surcharge. */
export class ValidateurOverrideConfiguration {
  /** Cette methode valide la commande d override. */
  public valider(commande: OverrideConfigurationCommand): void {
    if (commande.actorId.trim().length === 0) {
      throw new ExceptionConfigurationApplication('Un override de configuration exige un actorId.');
    }
  }
}
