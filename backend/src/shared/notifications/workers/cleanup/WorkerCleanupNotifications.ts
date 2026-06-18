import {
  ResultatExecutionWorkerNotification,
  WorkerCleanupNotification,
} from '../../infrastructure/workers';
import { ResultatExecutionWorkerNotifications } from '../TypesWorkersNotifications';

// Ce fichier expose le worker racine de nettoyage du module Notifications.

/** Cette classe encapsule le worker technique de nettoyage dans la couche workers officielle. */
export class WorkerCleanupNotifications {
  /** Ce constructeur relie la couche workers racine a l'implementation technique de nettoyage. */
  constructor(private readonly workerCleanupNotification: WorkerCleanupNotification) {}

  /** Cette methode execute un cycle de nettoyage et normalise son resultat. */
  public async executerCycle(): Promise<ResultatExecutionWorkerNotifications> {
    const resultat = await this.workerCleanupNotification.executerCycle();
    return this.normaliser(resultat);
  }

  /** Cette methode adapte le resultat technique vers le contrat public des workers. */
  private normaliser(
    resultat: ResultatExecutionWorkerNotification,
  ): ResultatExecutionWorkerNotifications {
    return {
      ...resultat,
      typeWorker: 'CLEANUP',
    };
  }
}
