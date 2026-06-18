import { ExceptionApplicationNotifications } from './ExceptionApplicationNotifications';

// Ce fichier declare l'exception de canal interdit.

/** Cette classe represente une tentative d'utilisation d'un canal interdit. */
export class ExceptionCanalInterditApplication extends ExceptionApplicationNotifications {
  /** Ce constructeur initialise le code stable de canal interdit. */
  constructor(message = 'Le canal demande n est pas autorise pour cette notification.') {
    super(message, 'NOTIFICATIONS_CANAL_INTERDIT');
    this.name = 'ExceptionCanalInterditApplication';
  }
}
