import {
  ResultatExecutionWorkerNotification,
  WorkerMonitoringNotificationBullMq,
} from '../../infrastructure/workers';
import { ResultatExecutionWorkerNotifications } from '../TypesWorkersNotifications';

// Ce fichier expose le worker racine de monitoring BullMQ du module Notifications.

/** Cette classe encapsule le worker technique BullMQ de monitoring dans la couche workers officielle. */
export class WorkerMonitoringNotificationsBullMq {
  /** Ce constructeur relie la couche workers racine a l implementation BullMQ de monitoring. */
  constructor(
    private readonly workerMonitoringNotificationBullMq: WorkerMonitoringNotificationBullMq,
  ) {}

  /** Cette methode execute un cycle BullMQ de monitoring et normalise son resultat. */
  public async executerCycle(): Promise<ResultatExecutionWorkerNotifications> {
    const resultat = await this.workerMonitoringNotificationBullMq.executerCycle();
    return this.normaliser(resultat);
  }

  /** Cette methode adapte le resultat technique BullMQ vers le contrat public des workers. */
  private normaliser(
    resultat: ResultatExecutionWorkerNotification,
  ): ResultatExecutionWorkerNotifications {
    return {
      ...resultat,
      typeWorker: 'MONITORING',
    };
  }
}
