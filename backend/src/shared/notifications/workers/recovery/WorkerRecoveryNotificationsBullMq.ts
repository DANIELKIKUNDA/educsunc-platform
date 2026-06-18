import {
  ResultatExecutionWorkerNotification,
  WorkerRecoveryNotificationBullMq,
} from '../../infrastructure/workers';
import { ResultatExecutionWorkerNotifications } from '../TypesWorkersNotifications';

// Ce fichier expose le worker racine de recovery BullMQ du module Notifications.

/** Cette classe encapsule le worker technique BullMQ de recovery dans la couche workers officielle. */
export class WorkerRecoveryNotificationsBullMq {
  /** Ce constructeur relie la couche workers racine a l implementation BullMQ de recovery. */
  constructor(
    private readonly workerRecoveryNotificationBullMq: WorkerRecoveryNotificationBullMq,
  ) {}

  /** Cette methode execute un cycle BullMQ de recovery et normalise son resultat. */
  public async executerCycle(): Promise<ResultatExecutionWorkerNotifications> {
    const resultat = await this.workerRecoveryNotificationBullMq.executerCycle();
    return this.normaliser(resultat);
  }

  /** Cette methode adapte le resultat technique BullMQ vers le contrat public des workers. */
  private normaliser(
    resultat: ResultatExecutionWorkerNotification,
  ): ResultatExecutionWorkerNotifications {
    return {
      ...resultat,
      typeWorker: 'RECOVERY',
    };
  }
}
