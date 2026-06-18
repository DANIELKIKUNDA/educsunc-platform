import { ExceptionApplicationNotifications } from './ExceptionApplicationNotifications';

// Ce fichier declare l'exception de rejeu non autorise.

/** Cette classe represente un rejeu refuse par les regles applicatives. */
export class ExceptionRejeuNonAutorise extends ExceptionApplicationNotifications {
  /** Ce constructeur initialise le code stable de rejeu non autorise. */
  constructor(message = 'Le rejeu de cette notification n est pas autorise.') {
    super(message, 'NOTIFICATIONS_REJEU_NON_AUTORISE');
    this.name = 'ExceptionRejeuNonAutorise';
  }
}
