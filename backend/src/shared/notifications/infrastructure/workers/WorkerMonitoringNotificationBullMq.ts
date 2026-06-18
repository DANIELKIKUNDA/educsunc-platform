// Ce fichier declare le worker de monitoring BullMQ du moteur Notifications.

import { WorkerMonitoringNotifications } from '../../workers/monitoring/WorkerMonitoringNotifications';
import { ResultatExecutionWorkerNotification } from './TypesWorkersNotifications';

/** Cette classe adapte le worker de monitoring racine au bloc technique BullMQ. */
export class WorkerMonitoringNotificationBullMq {
  /** Ce constructeur relie le worker BullMQ au worker de monitoring deja expose. */
  constructor(private readonly workerMonitoringNotification: WorkerMonitoringNotifications) {}

  /** Cette methode execute un cycle de monitoring et le convertit au type technique. */
  public async executerCycle(): Promise<ResultatExecutionWorkerNotification> {
    const resultat = await this.workerMonitoringNotification.executerCycle();
    return {
      ...resultat,
      typeWorker: 'MONITORING' as never,
    };
  }
}
