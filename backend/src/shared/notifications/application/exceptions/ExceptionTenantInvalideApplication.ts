import { ExceptionApplicationNotifications } from './ExceptionApplicationNotifications';

// Ce fichier declare l'exception de tenant invalide.

/** Cette classe represente une incoherence de tenant detectee par l'application. */
export class ExceptionTenantInvalideApplication extends ExceptionApplicationNotifications {
  /** Ce constructeur initialise le code stable de tenant invalide. */
  constructor(message = 'Le contexte tenant de la notification est invalide.') {
    super(message, 'NOTIFICATIONS_TENANT_INVALIDE');
    this.name = 'ExceptionTenantInvalideApplication';
  }
}
