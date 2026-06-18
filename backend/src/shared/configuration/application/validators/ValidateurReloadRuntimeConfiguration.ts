import { ReloadRuntimeConfigurationCommand } from '../commands';
import { ExceptionConfigurationApplication } from '../exceptions';

// Ce fichier declare le validateur de reload runtime.

/** Cette classe valide les donnees minimales de reload runtime. */
export class ValidateurReloadRuntimeConfiguration {
  /** Cette methode valide la commande de reload runtime. */
  public valider(commande: ReloadRuntimeConfigurationCommand): void {
    if (commande.configurationId.trim().length === 0) {
      throw new ExceptionConfigurationApplication('Le reload runtime exige un identifiant de configuration.');
    }
  }
}
