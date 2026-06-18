import { ExceptionApplicationNotifications } from './ExceptionApplicationNotifications';

// Ce fichier declare l'exception d'escalade hors scope.

/** Cette classe represente une tentative d'escalade en dehors du scope autorise. */
export class ExceptionEscaladeHorsScope extends ExceptionApplicationNotifications {
  /** Ce constructeur initialise le code stable d'escalade hors scope. */
  constructor(message = 'L escalade demandee depasse le scope autorise.') {
    super(message, 'NOTIFICATIONS_ESCALADE_HORS_SCOPE');
    this.name = 'ExceptionEscaladeHorsScope';
  }
}
