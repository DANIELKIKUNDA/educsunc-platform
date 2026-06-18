// Ce fichier decrit le modele de lecture de monitoring Notifications.

/** Cette interface represente une vue agregee de monitoring. */
export interface ModeleLectureMonitoringNotifications {
  readonly totalNotifications: number;
  readonly totalEnEchec: number;
  readonly totalEnRetry: number;
  readonly totalDeadLetters: number;
  readonly fournisseursDegrades: readonly string[];
  readonly queuesSaturees: readonly string[];
  readonly dateObservation: Date;
}
