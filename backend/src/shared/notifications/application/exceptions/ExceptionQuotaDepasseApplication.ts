import { ExceptionApplicationNotifications } from './ExceptionApplicationNotifications';

// Ce fichier declare l'exception de quota depasse.

/** Cette classe represente un depassement de quota detecte par l'application. */
export class ExceptionQuotaDepasseApplication extends ExceptionApplicationNotifications {
  /** Ce constructeur initialise le code stable de quota depasse. */
  constructor(message = 'Le quota applicable a cette notification est depasse.') {
    super(message, 'NOTIFICATIONS_QUOTA_DEPASSE');
    this.name = 'ExceptionQuotaDepasseApplication';
  }
}
