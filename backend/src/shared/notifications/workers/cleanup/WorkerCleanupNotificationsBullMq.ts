import {
  ResultatExecutionWorkerNotification,
  WorkerCleanupNotificationBullMq,
} from '../../infrastructure/workers';
import { ResultatExecutionWorkerNotifications } from '../TypesWorkersNotifications';

// Ce fichier expose le worker racine de cleanup BullMQ du module Notifications.

/** Cette classe encapsule le worker technique BullMQ de cleanup dans la couche workers officielle. */
export class WorkerCleanupNotificationsBullMq {
  /** Ce constructeur relie la couche workers racine a l implementation BullMQ de cleanup. */
  constructor(private readonly workerCleanupNotificationBullMq: WorkerCleanupNotificationBullMq) {}

  /** Cette methode execute un cycle BullMQ de cleanup et normalise son resultat. */
  public async executerCycle(): Promise<ResultatExecutionWorkerNotifications> {
    const resultat = await this.workerCleanupNotificationBullMq.executerCycle();
    return this.normaliser(resultat);
  }

  /** Cette methode adapte le resultat technique BullMQ vers le contrat public des workers. */
  private normaliser(
    resultat: ResultatExecutionWorkerNotification,
  ): ResultatExecutionWorkerNotifications {
    return {
      ...resultat,
      typeWorker: 'CLEANUP',
    };
  }
}
