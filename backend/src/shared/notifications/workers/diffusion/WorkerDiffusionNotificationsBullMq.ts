import {
  ResultatExecutionWorkerNotification,
  WorkerDiffusionNotificationBullMq,
} from '../../infrastructure/workers';
import { ResultatExecutionWorkerNotifications } from '../TypesWorkersNotifications';

// Ce fichier expose le worker racine de diffusion BullMQ du module Notifications.

/** Cette classe encapsule le worker technique BullMQ de diffusion dans la couche workers officielle. */
export class WorkerDiffusionNotificationsBullMq {
  /** Ce constructeur relie la couche workers racine a l implementation BullMQ de diffusion. */
  constructor(
    private readonly workerDiffusionNotificationBullMq: WorkerDiffusionNotificationBullMq,
  ) {}

  /** Cette methode execute un cycle BullMQ de diffusion et normalise son resultat. */
  public async executerCycle(limite = 25): Promise<ResultatExecutionWorkerNotifications> {
    const resultat = await this.workerDiffusionNotificationBullMq.executerCycle(limite);
    return this.normaliser(resultat);
  }

  /** Cette methode adapte le resultat technique BullMQ vers le contrat public des workers. */
  private normaliser(
    resultat: ResultatExecutionWorkerNotification,
  ): ResultatExecutionWorkerNotifications {
    return {
      ...resultat,
      typeWorker: 'DIFFUSION',
    };
  }
}
