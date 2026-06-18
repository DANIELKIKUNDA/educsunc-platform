// Ce fichier declare le worker de nettoyage technique du moteur Notifications.

import { PortMonitoringNotification } from '../../application';
import { RecuperationQueuesNotifications } from '../recovery';
import { ResultatExecutionWorkerNotification } from './TypesWorkersNotifications';

/** Cette classe execute un nettoyage technique leger et sans etat du runtime Notifications. */
export class WorkerCleanupNotification {
  /** Ce constructeur relie le worker aux briques de nettoyage deja existantes. */
  constructor(
    private readonly recuperationQueuesNotifications: RecuperationQueuesNotifications,
    private readonly portMonitoringNotification: PortMonitoringNotification,
  ) {}

  /** Cette methode execute un cycle de nettoyage technique. */
  public async executerCycle(): Promise<ResultatExecutionWorkerNotification> {
    const nettoyage = this.recuperationQueuesNotifications.nettoyerJobsInvalides();
    const volumes = this.recuperationQueuesNotifications.observerVolumes();

    await this.portMonitoringNotification.enregistrerSignal('notifications.cleanup.executed', {
      jobsSupprimes: nettoyage.elementsTraites,
      jobsRestants: volumes.elementsTraites,
    });

    return {
      typeWorker: 'CLEANUP',
      succes: nettoyage.succes && volumes.succes,
      totalTraites: nettoyage.elementsTraites + volumes.elementsTraites,
      totalSucces: nettoyage.succes && volumes.succes ? 1 : 0,
      totalEchecs: nettoyage.succes && volumes.succes ? 0 : 1,
      executeLe: new Date(),
      details: [
        {
          identifiantNotification: 'QUEUES',
          succes: nettoyage.succes,
          message: 'Nettoyage des jobs invalides execute.',
          metadata: nettoyage.metadata,
        },
        {
          identifiantNotification: 'QUEUES',
          succes: volumes.succes,
          message: 'Observation des volumes de files executee.',
          metadata: volumes.metadata,
        },
      ],
      metadata: {},
    };
  }
}
