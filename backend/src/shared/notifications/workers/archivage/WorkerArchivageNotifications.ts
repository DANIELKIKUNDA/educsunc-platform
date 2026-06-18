import {
  ResultatExecutionWorkerNotification,
  WorkerArchivageNotification,
} from '../../infrastructure/workers';
import { ResultatExecutionWorkerNotifications } from '../TypesWorkersNotifications';

// Ce fichier expose le worker racine d'archivage du module Notifications.

/** Cette classe encapsule le worker technique d'archivage dans la couche workers officielle. */
export class WorkerArchivageNotifications {
  /** Ce constructeur relie la couche workers racine a l'implementation technique d'archivage. */
  constructor(private readonly workerArchivageNotification: WorkerArchivageNotification) {}

  /** Cette methode execute un cycle d'archivage et normalise son resultat. */
  public async executerCycle(
    limite = 50,
    raisonArchivage = 'worker-archivage-runtime',
  ): Promise<ResultatExecutionWorkerNotifications> {
    const resultat = await this.workerArchivageNotification.executerCycle(limite, raisonArchivage);
    return this.normaliser(resultat);
  }

  /** Cette methode adapte le resultat technique vers le contrat public des workers. */
  private normaliser(
    resultat: ResultatExecutionWorkerNotification,
  ): ResultatExecutionWorkerNotifications {
    return {
      ...resultat,
      typeWorker: 'ARCHIVAGE',
    };
  }
}
