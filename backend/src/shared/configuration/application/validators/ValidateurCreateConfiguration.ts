import { ExceptionConfigurationApplication } from '../exceptions';
import { CreateConfigurationCommand } from '../commands';

// Ce fichier declare le validateur de creation.

/** Cette classe valide les donnees minimales de creation. */
export class ValidateurCreateConfiguration {
  /** Cette methode valide la commande de creation. */
  public valider(commande: CreateConfigurationCommand): void {
    if (commande.key.trim().length === 0) {
      throw new ExceptionConfigurationApplication('La cle de configuration est obligatoire.');
    }
  }
}
