import {
  ResultatExecutionWorkerNotification,
  WorkerRetryNotification,
} from '../../infrastructure/workers';
import { ResultatExecutionWorkerNotifications } from '../TypesWorkersNotifications';

// Ce fichier expose le worker racine de retry du module Notifications.

/** Cette classe encapsule le worker technique de retry dans la couche workers officielle. */
export class WorkerRetryNotifications {
  /** Ce constructeur relie la couche workers racine a l'implementation technique de retry. */
  constructor(private readonly workerRetryNotification: WorkerRetryNotification) {}

  /** Cette methode execute un cycle de retry et normalise son resultat. */
  public async executerCycle(): Promise<ResultatExecutionWorkerNotifications> {
    const resultat = await this.workerRetryNotification.executerCycle();
    return this.normaliser(resultat);
  }

  /** Cette methode adapte le resultat technique vers le contrat public des workers. */
  private normaliser(
    resultat: ResultatExecutionWorkerNotification,
  ): ResultatExecutionWorkerNotifications {
    return {
      ...resultat,
      typeWorker: 'RETRY',
    };
  }
}
