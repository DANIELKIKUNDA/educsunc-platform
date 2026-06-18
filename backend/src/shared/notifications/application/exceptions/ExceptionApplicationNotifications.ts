// Ce fichier declare l'exception de base de la couche application Notifications.

/** Cette classe represente la base de toutes les exceptions applicatives Notifications. */
export class ExceptionApplicationNotifications extends Error {
  /** Ce constructeur capture le message et le code stable de l'erreur. */
  constructor(message: string, public readonly code: string = 'NOTIFICATIONS_APPLICATION') {
    super(message);
    this.name = 'ExceptionApplicationNotifications';
  }
}
