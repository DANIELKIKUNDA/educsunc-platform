import {
  ResultatExecutionWorkerNotification,
  WorkerEscaladeNotification,
} from '../../infrastructure/workers';
import { ResultatExecutionWorkerNotifications } from '../TypesWorkersNotifications';

// Ce fichier expose le worker racine d'escalade du module Notifications.

/** Cette classe encapsule le worker technique d'escalade dans la couche workers officielle. */
export class WorkerEscaladeNotifications {
  /** Ce constructeur relie la couche workers racine a l'implementation technique d'escalade. */
  constructor(private readonly workerEscaladeNotification: WorkerEscaladeNotification) {}

  /** Cette methode execute un cycle d'escalade et normalise son resultat. */
  public async executerCycle(limite = 25): Promise<ResultatExecutionWorkerNotifications> {
    const resultat = await this.workerEscaladeNotification.executerCycle(limite);
    return this.normaliser(resultat);
  }

  /** Cette methode adapte le resultat technique vers le contrat public des workers. */
  private normaliser(
    resultat: ResultatExecutionWorkerNotification,
  ): ResultatExecutionWorkerNotifications {
    return {
      ...resultat,
      typeWorker: 'ESCALADE',
    };
  }
}
