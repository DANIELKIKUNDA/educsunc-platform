// Ce fichier declare les types publics de la couche workers Notifications.

/** Cette union represente les familles de workers exposes par la couche runtime. */
export type TypeWorkerNotifications =
  | 'DIFFUSION'
  | 'RETRY'
  | 'REPLAY'
  | 'ESCALADE'
  | 'MONITORING'
  | 'ARCHIVAGE'
  | 'CLEANUP'
  | 'RECOVERY';

/** Cette interface represente le detail d'execution retourne par un worker racine. */
export interface DetailExecutionWorkerNotifications {
  readonly identifiantNotification: string;
  readonly succes: boolean;
  readonly message: string;
  readonly metadata: Readonly<Record<string, unknown>>;
}

/** Cette interface represente le resultat consolide d'un cycle worker racine. */
export interface ResultatExecutionWorkerNotifications {
  readonly typeWorker: TypeWorkerNotifications;
  readonly succes: boolean;
  readonly totalTraites: number;
  readonly totalSucces: number;
  readonly totalEchecs: number;
  readonly executeLe: Date;
  readonly details: readonly DetailExecutionWorkerNotifications[];
  readonly metadata: Readonly<Record<string, unknown>>;
}
