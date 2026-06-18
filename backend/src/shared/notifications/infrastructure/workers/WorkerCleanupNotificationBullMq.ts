// Ce fichier declare le worker de cleanup BullMQ du moteur Notifications.

import { WorkerCleanupNotification } from './WorkerCleanupNotification';
import { ResultatExecutionWorkerNotification } from './TypesWorkersNotifications';

/** Cette classe adapte le nettoyage existant au parcours BullMQ du runtime. */
export class WorkerCleanupNotificationBullMq {
  /** Ce constructeur relie le worker BullMQ a l implementation technique de cleanup. */
  constructor(private readonly workerCleanupNotification: WorkerCleanupNotification) {}

  /** Cette methode execute un cycle de cleanup BullMQ. */
  public async executerCycle(): Promise<ResultatExecutionWorkerNotification> {
    return this.workerCleanupNotification.executerCycle();
  }
}
