// Ce fichier declare le worker de recovery BullMQ du moteur Notifications.

import { WorkerRecoveryNotification } from './WorkerRecoveryNotification';
import { ResultatExecutionWorkerNotification } from './TypesWorkersNotifications';

/** Cette classe adapte le worker de recovery existant au parcours BullMQ du runtime. */
export class WorkerRecoveryNotificationBullMq {
  /** Ce constructeur relie le worker BullMQ a l implementation technique de recovery. */
  constructor(private readonly workerRecoveryNotification: WorkerRecoveryNotification) {}

  /** Cette methode execute un cycle de recovery BullMQ. */
  public async executerCycle(): Promise<ResultatExecutionWorkerNotification> {
    return this.workerRecoveryNotification.executerCycle();
  }
}
