import { TypeWorkerNotifications } from '../../workers';

// Ce fichier expose le manifest local des workers Notifications.

const WORKERS_NOTIFICATIONS: readonly TypeWorkerNotifications[] = [
  'DIFFUSION',
  'RETRY',
  'REPLAY',
  'ESCALADE',
  'MONITORING',
  'ARCHIVAGE',
  'CLEANUP',
  'RECOVERY',
];

/** Cette classe decrit les workers exploitables localement par le module Notifications. */
export class ManifestWorkersNotifications {
  /** Cette methode retourne le manifest des workers et des operations associees. */
  public construire(): {
    readonly totalWorkers: number;
    readonly workers: readonly TypeWorkerNotifications[];
    readonly operations: readonly string[];
  } {
    return {
      totalWorkers: WORKERS_NOTIFICATIONS.length,
      workers: WORKERS_NOTIFICATIONS,
      operations: [
        'executer-cycle-diffusion',
        'executer-cycle-retry',
        'executer-cycle-replay',
        'executer-cycle-recovery',
      ],
    };
  }
}
