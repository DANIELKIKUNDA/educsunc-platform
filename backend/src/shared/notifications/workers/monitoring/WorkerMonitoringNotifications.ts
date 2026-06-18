import { AdaptateurMonitoringNotification } from '../../infrastructure/monitoring';
import { ResultatExecutionWorkerNotifications } from '../TypesWorkersNotifications';

// Ce fichier expose le worker racine de monitoring du module Notifications.

/** Cette classe execute une passe de supervision et la publie sous forme de resultat worker. */
export class WorkerMonitoringNotifications {
  /** Ce constructeur relie le worker au moteur de monitoring technique. */
  constructor(private readonly adaptateurMonitoringNotification: AdaptateurMonitoringNotification) {}

  /** Cette methode execute une passe de supervision et consolide le snapshot obtenu. */
  public async executerCycle(): Promise<ResultatExecutionWorkerNotifications> {
    const snapshot = await this.adaptateurMonitoringNotification.observer();
    const details = [
      {
        identifiantNotification: 'SIGNAUX',
        succes: true,
        message: 'Les signaux recents ont ete consolides.',
        metadata: {
          total: snapshot.signauxRecents.length,
        },
      },
      {
        identifiantNotification: 'QUEUES',
        succes: !snapshot.files.saturationDetectee,
        message: snapshot.files.saturationDetectee
          ? 'Une saturation de files a ete detectee.'
          : 'Les files sont dans un etat acceptable.',
        metadata: {
          ...snapshot.files,
        },
      },
      {
        identifiantNotification: 'PROVIDERS',
        succes: snapshot.providers.totalIndisponibles === 0,
        message:
          snapshot.providers.totalIndisponibles === 0
            ? 'Les providers sont disponibles.'
            : 'Au moins un provider est indisponible.',
        metadata: {
          totalProviders: snapshot.providers.totalProviders,
          totalIndisponibles: snapshot.providers.totalIndisponibles,
        },
      },
    ] as const;
    const totalSucces = details.filter((detail) => detail.succes).length;

    return {
      typeWorker: 'MONITORING',
      succes: details.every((detail) => detail.succes),
      totalTraites: details.length,
      totalSucces,
      totalEchecs: details.length - totalSucces,
      executeLe: new Date(),
      details,
      metadata: {
        collecteLe: snapshot.collecteLe.toISOString(),
      },
    };
  }
}
