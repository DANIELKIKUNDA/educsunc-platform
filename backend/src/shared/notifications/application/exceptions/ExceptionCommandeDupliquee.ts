import { ExceptionApplicationNotifications } from './ExceptionApplicationNotifications';

// Ce fichier declare l'exception de commande dupliquee.

/** Cette classe represente une commande rejouee ou emise plusieurs fois. */
export class ExceptionCommandeDupliquee extends ExceptionApplicationNotifications {
  /** Ce constructeur initialise le code stable de duplication de commande. */
  constructor(message = 'La commande a deja ete traitee pour cette notification.') {
    super(message, 'NOTIFICATIONS_COMMANDE_DUPLIQUEE');
    this.name = 'ExceptionCommandeDupliquee';
  }
}
