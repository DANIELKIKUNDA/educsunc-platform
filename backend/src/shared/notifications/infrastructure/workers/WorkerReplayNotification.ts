// Ce fichier declare le worker de replay technique du moteur Notifications.

import { ExecutantReplayNotification } from '../replay';
import { ResultatExecutionWorkerNotification } from './TypesWorkersNotifications';

/** Cette classe encapsule l'executant replay dans un worker standardise. */
export class WorkerReplayNotification {
  /** Ce constructeur relie le worker a l'executant technique de replay. */
  constructor(private readonly executantReplayNotification: ExecutantReplayNotification) {}

  /** Cette methode execute un cycle complet de replay et consolide le resultat. */
  public async executerCycle(): Promise<ResultatExecutionWorkerNotification> {
    const resultats = await this.executantReplayNotification.executerCycle();
    const totalSucces = resultats.filter((resultat) => resultat.succes).length;

    return {
      typeWorker: 'REPLAY',
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
          identifiantReplay: resultat.identifiantReplay,
        },
      })),
      metadata: {},
    };
  }
}
