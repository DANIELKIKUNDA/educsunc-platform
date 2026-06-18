// Ce fichier declare les types techniques du bloc workers Notifications.

/** Cette union represente les familles de workers techniques du moteur Notifications. */
export type TypeWorkerNotification =
  | 'DIFFUSION'
  | 'RETRY'
  | 'REPLAY'
  | 'ESCALADE'
  | 'MONITORING'
  | 'ARCHIVAGE'
  | 'CLEANUP'
  | 'RECOVERY';

/** Cette interface represente le detail d'execution d'un job technique par un worker. */
export interface DetailExecutionWorkerNotification {
  readonly identifiantNotification: string;
  readonly succes: boolean;
  readonly message: string;
  readonly metadata: Readonly<Record<string, unknown>>;
}

/** Cette interface represente le resultat consolide d'un cycle worker. */
export interface ResultatExecutionWorkerNotification {
  readonly typeWorker: TypeWorkerNotification;
  readonly succes: boolean;
  readonly totalTraites: number;
  readonly totalSucces: number;
  readonly totalEchecs: number;
  readonly executeLe: Date;
  readonly details: readonly DetailExecutionWorkerNotification[];
  readonly metadata: Readonly<Record<string, unknown>>;
}
