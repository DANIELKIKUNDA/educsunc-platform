// Ce fichier declare le worker de retry technique du moteur Notifications.

import { ExecutantRetryNotification } from '../retry';
import { ResultatExecutionWorkerNotification } from './TypesWorkersNotifications';

/** Cette classe encapsule l'executant retry dans un worker standardise. */
export class WorkerRetryNotification {
  /** Ce constructeur relie le worker a l'executant technique de retry. */
  constructor(private readonly executantRetryNotification: ExecutantRetryNotification) {}

  /** Cette methode execute un cycle complet de retry et consolide le resultat. */
  public async executerCycle(): Promise<ResultatExecutionWorkerNotification> {
    const resultats = await this.executantRetryNotification.executerCycle();
    const totalSucces = resultats.filter((resultat) => resultat.succes).length;

    return {
      typeWorker: 'RETRY',
      succes: resultats.every((resultat) => resultat.succes),
      totalTraites: resultats.length,
      totalSucces,
      totalEchecs: resultats.length - totalSucces,
      executeLe: new Date(),
      details: resultats.map((resultat) => ({
        identifiantNotification: resultat.identifiantNotification,
        succes: resultat.succes,
        message: resultat.message,
        metadata: {
          identifiantRetry: resultat.identifiantRetry,
        },
      })),
      metadata: {},
    };
  }
}
