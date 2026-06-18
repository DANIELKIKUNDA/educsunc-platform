import { ExceptionApplicationNotifications } from './ExceptionApplicationNotifications';

// Ce fichier declare l'exception de payload invalide.

/** Cette classe represente un payload applicatif incoherent. */
export class ExceptionPayloadInvalideNotification extends ExceptionApplicationNotifications {
  /** Ce constructeur initialise le code stable de payload invalide. */
  constructor(message = 'Le payload de notification est invalide.') {
    super(message, 'NOTIFICATIONS_PAYLOAD_INVALIDE');
    this.name = 'ExceptionPayloadInvalideNotification';
  }
}
