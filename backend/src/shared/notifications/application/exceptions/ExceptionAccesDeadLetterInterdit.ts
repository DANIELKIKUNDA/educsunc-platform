import { ExceptionApplicationNotifications } from './ExceptionApplicationNotifications';

// Ce fichier declare l'exception d'acces interdit aux dead letters.

/** Cette classe represente un refus d'acces aux dead letters Notifications. */
export class ExceptionAccesDeadLetterInterdit extends ExceptionApplicationNotifications {
  /** Ce constructeur initialise le code stable d'acces interdit aux dead letters. */
  constructor(message = 'L acces aux dead letters Notifications est interdit.') {
    super(message, 'NOTIFICATIONS_DEAD_LETTER_INTERDIT');
    this.name = 'ExceptionAccesDeadLetterInterdit';
  }
}
