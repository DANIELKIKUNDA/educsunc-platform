import {
  ResultatExecutionWorkerNotification,
  WorkerRecoveryNotification,
} from '../../infrastructure/workers';
import { ResultatExecutionWorkerNotifications } from '../TypesWorkersNotifications';

// Ce fichier expose le worker racine de recovery du module Notifications.

/** Cette classe encapsule le worker technique de recovery dans la couche workers officielle. */
export class WorkerRecoveryNotifications {
  /** Ce constructeur relie la couche workers racine a l'implementation technique de recovery. */
  constructor(private readonly workerRecoveryNotification: WorkerRecoveryNotification) {}

  /** Cette methode execute un cycle de recovery et normalise son resultat. */
  public async executerCycle(): Promise<ResultatExecutionWorkerNotifications> {
    const resultat = await this.workerRecoveryNotification.executerCycle();
    return this.normaliser(resultat);
  }

  /** Cette methode adapte le resultat technique vers le contrat public des workers. */
  private normaliser(
    resultat: ResultatExecutionWorkerNotification,
  ): ResultatExecutionWorkerNotifications {
    return {
      ...resultat,
      typeWorker: 'RECOVERY',
    };
  }
}
