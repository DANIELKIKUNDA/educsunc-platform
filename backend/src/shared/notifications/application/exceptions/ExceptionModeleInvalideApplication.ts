import { ExceptionApplicationNotifications } from './ExceptionApplicationNotifications';

// Ce fichier declare l'exception de modele invalide.

/** Cette classe represente un modele de notification inexploitable. */
export class ExceptionModeleInvalideApplication extends ExceptionApplicationNotifications {
  /** Ce constructeur initialise le code stable de modele invalide. */
  constructor(message = 'Le modele de notification est invalide ou incomplet.') {
    super(message, 'NOTIFICATIONS_MODELE_INVALIDE');
    this.name = 'ExceptionModeleInvalideApplication';
  }
}
