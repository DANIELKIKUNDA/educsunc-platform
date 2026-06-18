import {
  ResultatExecutionWorkerNotification,
  WorkerDiffusionNotification,
} from '../../infrastructure/workers';
import { ResultatExecutionWorkerNotifications } from '../TypesWorkersNotifications';

// Ce fichier expose le worker racine de diffusion du module Notifications.

/** Cette classe encapsule le worker de diffusion technique dans la couche workers officielle. */
export class WorkerDiffusionNotifications {
  /** Ce constructeur relie la couche workers racine a l'implementation technique de diffusion. */
  constructor(private readonly workerDiffusionNotification: WorkerDiffusionNotification) {}

  /** Cette methode execute un cycle de diffusion et normalise son resultat. */
  public async executerCycle(limite = 25): Promise<ResultatExecutionWorkerNotifications> {
    const resultat = await this.workerDiffusionNotification.executerCycle(limite);
    return this.normaliser(resultat);
  }

  /** Cette methode adapte le resultat technique vers le contrat public des workers. */
  private normaliser(
    resultat: ResultatExecutionWorkerNotification,
  ): ResultatExecutionWorkerNotifications {
    return {
      ...resultat,
      typeWorker: 'DIFFUSION',
    };
  }
}
