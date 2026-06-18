import {
  AdaptateurMonitoringNotification,
  SnapshotMonitoringNotification,
} from '../../infrastructure/monitoring';

// Ce fichier expose le runtime de monitoring du module Notifications.

/** Cette classe centralise l'acces runtime au snapshot de monitoring technique. */
export class RuntimeMonitoringNotifications {
  /** Ce constructeur relie le runtime a l'adaptateur de monitoring du moteur. */
  constructor(
    private readonly adaptateurMonitoringNotification: AdaptateurMonitoringNotification,
  ) {}

  /** Cette methode retourne le snapshot de monitoring courant. */
  public async observer(): Promise<SnapshotMonitoringNotification> {
    return this.adaptateurMonitoringNotification.observer();
  }
}
