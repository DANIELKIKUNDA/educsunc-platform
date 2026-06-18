import {
  ResultatExecutionWorkerNotification,
  WorkerEscaladeNotificationBullMq,
} from '../../infrastructure/workers';
import { ResultatExecutionWorkerNotifications } from '../TypesWorkersNotifications';

// Ce fichier expose le worker racine d escalade BullMQ du module Notifications.

/** Cette classe encapsule le worker technique BullMQ d escalade dans la couche workers officielle. */
export class WorkerEscaladeNotificationsBullMq {
  /** Ce constructeur relie la couche workers racine a l implementation BullMQ d escalade. */
  constructor(
    private readonly workerEscaladeNotificationBullMq: WorkerEscaladeNotificationBullMq,
  ) {}

  /** Cette methode execute un cycle BullMQ d escalade et normalise son resultat. */
  public async executerCycle(): Promise<ResultatExecutionWorkerNotifications> {
    const resultat = await this.workerEscaladeNotificationBullMq.executerCycle();
    return this.normaliser(resultat);
  }

  /** Cette methode adapte le resultat technique BullMQ vers le contrat public des workers. */
  private normaliser(
    resultat: ResultatExecutionWorkerNotification,
  ): ResultatExecutionWorkerNotifications {
    return {
      ...resultat,
      typeWorker: 'ESCALADE',
    };
  }
}
