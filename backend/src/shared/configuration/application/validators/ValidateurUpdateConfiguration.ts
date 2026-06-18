import { UpdateConfigurationCommand } from '../commands';
import { ExceptionConfigurationApplication } from '../exceptions';

// Ce fichier declare le validateur de mise a jour.

/** Cette classe valide les donnees minimales de mise a jour. */
export class ValidateurUpdateConfiguration {
  /** Cette methode valide la commande de mise a jour. */
  public valider(commande: UpdateConfigurationCommand): void {
    if (commande.configurationId.trim().length === 0) {
      throw new ExceptionConfigurationApplication('L identifiant de configuration est obligatoire.');
    }
  }
}
