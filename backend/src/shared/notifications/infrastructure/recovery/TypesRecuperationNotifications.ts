// Ce fichier declare les types techniques du bloc recovery Notifications.

/** Cette union represente les sous-systemes techniques recuperables du moteur Notifications. */
export type CibleRecuperationNotification =
  | 'QUEUES'
  | 'STORAGE'
  | 'PROVIDERS'
  | 'TENANT'
  | 'DEAD_LETTER';

/** Cette interface represente une operation technique de recuperation. */
export interface OperationRecuperationNotification {
  readonly cible: CibleRecuperationNotification;
  readonly succes: boolean;
  readonly recupereLe: Date;
  readonly raison?: string;
  readonly elementsTraites: number;
  readonly metadata: Readonly<Record<string, unknown>>;
}

/** Cette interface represente un snapshot global de recovery du moteur Notifications. */
export interface SnapshotRecuperationNotifications {
  readonly operationsRecentes: readonly OperationRecuperationNotification[];
  readonly collecteLe: Date;
}
