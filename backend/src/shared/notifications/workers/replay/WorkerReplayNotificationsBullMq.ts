import {
  ResultatExecutionWorkerNotification,
  WorkerReplayNotificationBullMq,
} from '../../infrastructure/workers';
import { ResultatExecutionWorkerNotifications } from '../TypesWorkersNotifications';

// Ce fichier expose le worker racine de replay BullMQ du module Notifications.

/** Cette classe encapsule le worker technique BullMQ de replay dans la couche workers officielle. */
export class WorkerReplayNotificationsBullMq {
  /** Ce constructeur relie la couche workers racine a l implementation BullMQ de replay. */
  constructor(private readonly workerReplayNotificationBullMq: WorkerReplayNotificationBullMq) {}

  /** Cette methode execute un cycle BullMQ de replay et normalise son resultat. */
  public async executerCycle(): Promise<ResultatExecutionWorkerNotifications> {
    const resultat = await this.workerReplayNotificationBullMq.executerCycle();
    return this.normaliser(resultat);
  }

  /** Cette methode adapte le resultat technique BullMQ vers le contrat public des workers. */
  private normaliser(
    resultat: ResultatExecutionWorkerNotification,
  ): ResultatExecutionWorkerNotifications {
    return {
      ...resultat,
      typeWorker: 'REPLAY',
    };
  }
}
