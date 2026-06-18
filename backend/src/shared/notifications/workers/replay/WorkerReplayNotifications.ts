import {
  ResultatExecutionWorkerNotification,
  WorkerReplayNotification,
} from '../../infrastructure/workers';
import { ResultatExecutionWorkerNotifications } from '../TypesWorkersNotifications';

// Ce fichier expose le worker racine de replay du module Notifications.

/** Cette classe encapsule le worker technique de replay dans la couche workers officielle. */
export class WorkerReplayNotifications {
  /** Ce constructeur relie la couche workers racine a l'implementation technique de replay. */
  constructor(private readonly workerReplayNotification: WorkerReplayNotification) {}

  /** Cette methode execute un cycle de replay et normalise son resultat. */
  public async executerCycle(): Promise<ResultatExecutionWorkerNotifications> {
    const resultat = await this.workerReplayNotification.executerCycle();
    return this.normaliser(resultat);
  }

  /** Cette methode adapte le resultat technique vers le contrat public des workers. */
  private normaliser(
    resultat: ResultatExecutionWorkerNotification,
  ): ResultatExecutionWorkerNotifications {
    return {
      ...resultat,
      typeWorker: 'REPLAY',
    };
  }
}
