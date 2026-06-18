import { MonitoringValidationException } from '../exceptions';
import type { CreateAlertCommand } from '../commands';

// Ce fichier declare le validateur de creation d alerte.

/** Cette classe valide la creation applicative d une alerte. */
export class ValidateCreateAlert {
  /** Cette methode valide une commande de creation d alerte. */
  public valider(commande: CreateAlertCommand): void {
    if (!commande.alertId || !commande.indicateur || commande.critical < commande.warning) {
      throw new MonitoringValidationException('La commande de creation d alerte est incoherente.');
    }
  }
}
