import { ExceptionApplicationNotifications } from './ExceptionApplicationNotifications';

// Ce fichier declare l'exception d'acces interdit au monitoring.

/** Cette classe represente un refus d'acces au monitoring Notifications. */
export class ExceptionAccesMonitoringInterdit extends ExceptionApplicationNotifications {
  /** Ce constructeur initialise le code stable d'acces interdit au monitoring. */
  constructor(message = 'L acces au monitoring Notifications est interdit.') {
    super(message, 'NOTIFICATIONS_MONITORING_INTERDIT');
    this.name = 'ExceptionAccesMonitoringInterdit';
  }
}
