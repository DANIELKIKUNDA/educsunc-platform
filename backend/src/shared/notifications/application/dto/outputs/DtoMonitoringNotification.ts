// Ce fichier expose le DTO stable de monitoring Notifications.

/** Cette interface represente la vue agregée de monitoring Notifications. */
export interface DtoMonitoringNotification {
  readonly total: number;
  readonly enEchec: number;
  readonly enRetry: number;
  readonly enDeadLetter: number;
  readonly fournisseursDegrades: readonly string[];
  readonly saturationQueues: readonly string[];
}
