// Ce fichier expose le DTO HTTP de sortie pour une ligne de liste Notifications.

/** Cette interface represente un element serialisable de liste HTTP Notifications. */
export interface DtoHttpNotification {
  readonly identifiant: string;
  readonly type: string;
  readonly statut: string;
  readonly titre?: string;
  readonly messageResume: string;
  readonly creeLe: string;
}
