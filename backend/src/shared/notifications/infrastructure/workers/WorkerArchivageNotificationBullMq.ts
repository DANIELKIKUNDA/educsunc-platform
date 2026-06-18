// Ce fichier declare le worker d archivage BullMQ du moteur Notifications.

import { WorkerArchivageNotification } from './WorkerArchivageNotification';
import { ResultatExecutionWorkerNotification } from './TypesWorkersNotifications';

/** Cette classe adapte l archivage existant au parcours BullMQ du runtime. */
export class WorkerArchivageNotificationBullMq {
  /** Ce constructeur relie le worker BullMQ a l implementation technique d archivage. */
  constructor(private readonly workerArchivageNotification: WorkerArchivageNotification) {}

  /** Cette methode execute un cycle d archivage BullMQ. */
  public async executerCycle(
    limite = 50,
    raisonArchivage = 'worker-archivage-bullmq',
  ): Promise<ResultatExecutionWorkerNotification> {
    return this.workerArchivageNotification.executerCycle(limite, raisonArchivage);
  }
}
