import {
  ResultatExecutionWorkerNotification,
  WorkerRetryNotificationBullMq,
} from '../../infrastructure/workers';
import { ResultatExecutionWorkerNotifications } from '../TypesWorkersNotifications';

// Ce fichier expose le worker racine de retry BullMQ du module Notifications.

/** Cette classe encapsule le worker technique BullMQ de retry dans la couche workers officielle. */
export class WorkerRetryNotificationsBullMq {
  /** Ce constructeur relie la couche workers racine a l implementation BullMQ de retry. */
  constructor(private readonly workerRetryNotificationBullMq: WorkerRetryNotificationBullMq) {}

  /** Cette methode execute un cycle BullMQ de retry et normalise son resultat. */
  public async executerCycle(): Promise<ResultatExecutionWorkerNotifications> {
    const resultat = await this.workerRetryNotificationBullMq.executerCycle();
    return this.normaliser(resultat);
  }

  /** Cette methode adapte le resultat technique BullMQ vers le contrat public des workers. */
  private normaliser(
    resultat: ResultatExecutionWorkerNotification,
  ): ResultatExecutionWorkerNotifications {
    return {
      ...resultat,
      typeWorker: 'RETRY',
    };
  }
}
