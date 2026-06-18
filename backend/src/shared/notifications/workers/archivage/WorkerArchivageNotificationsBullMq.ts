import {
  ResultatExecutionWorkerNotification,
  WorkerArchivageNotificationBullMq,
} from '../../infrastructure/workers';
import { ResultatExecutionWorkerNotifications } from '../TypesWorkersNotifications';

// Ce fichier expose le worker racine d archivage BullMQ du module Notifications.

/** Cette classe encapsule le worker technique BullMQ d archivage dans la couche workers officielle. */
export class WorkerArchivageNotificationsBullMq {
  /** Ce constructeur relie la couche workers racine a l implementation BullMQ d archivage. */
  constructor(
    private readonly workerArchivageNotificationBullMq: WorkerArchivageNotificationBullMq,
  ) {}

  /** Cette methode execute un cycle BullMQ d archivage et normalise son resultat. */
  public async executerCycle(): Promise<ResultatExecutionWorkerNotifications> {
    const resultat = await this.workerArchivageNotificationBullMq.executerCycle();
    return this.normaliser(resultat);
  }

  /** Cette methode adapte le resultat technique BullMQ vers le contrat public des workers. */
  private normaliser(
    resultat: ResultatExecutionWorkerNotification,
  ): ResultatExecutionWorkerNotifications {
    return {
      ...resultat,
      typeWorker: 'ARCHIVAGE',
    };
  }
}
