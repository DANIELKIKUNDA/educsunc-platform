// Ce fichier declare le worker de replay BullMQ du moteur Notifications.

import { PortMonitoringNotification } from '../../application';
import { StockageChronologieNotification } from '../chronology';
import { FileReplayNotificationsBullMq, JobFileNotification } from '../queues';
import { StockageReplayNotification } from '../replay';
import { ResultatExecutionReplayNotification } from '../replay/TypesReplayNotification';
import { ResultatExecutionWorkerNotification } from './TypesWorkersNotifications';

/** Cette classe consomme la file BullMQ de replay et produit un historique technique stable. */
export class WorkerReplayNotificationBullMq {
  /** Ce constructeur assemble les dependances techniques du rejeu BullMQ. */
  constructor(
    private readonly fileReplayNotificationsBullMq: FileReplayNotificationsBullMq,
    private readonly stockageReplayNotification: StockageReplayNotification,
    private readonly stockageChronologieNotification: StockageChronologieNotification,
    private readonly portMonitoringNotification: PortMonitoringNotification,
  ) {}

  /** Cette methode execute un cycle complet de replay BullMQ. */
  public async executerCycle(limite = 10): Promise<ResultatExecutionWorkerNotification> {
    const resultats: ResultatExecutionReplayNotification[] = [];

    while (resultats.length < limite) {
      const job = await this.fileReplayNotificationsBullMq.extraireProchainDisponible();
      if (!job) {
        break;
      }
      resultats.push(await this.executerJob(job));
    }

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

  /** Cette methode execute un job unique de rejeu technique. */
  private async executerJob(job: JobFileNotification): Promise<ResultatExecutionReplayNotification> {
    const entree = this.stockageReplayNotification.ouvrir(job.identifiantNotification, job.metadata);

    try {
      if (job.metadata.rebatirChronologie) {
        await this.stockageChronologieNotification.lireProjection(job.identifiantNotification);
      }

      this.stockageReplayNotification.terminer(
        job.identifiantNotification,
        entree.identifiantReplay,
        true,
      );
      await this.portMonitoringNotification.enregistrerSignal('notifications.replay.executed', {
        notificationId: job.identifiantNotification,
        replayId: entree.identifiantReplay,
      });

      return {
        identifiantNotification: job.identifiantNotification,
        identifiantReplay: entree.identifiantReplay,
        succes: true,
        message: 'Rejeu technique BullMQ execute.',
        horodatage: new Date(),
      };
    } catch (erreur) {
      const message = erreur instanceof Error ? erreur.message : 'Echec technique de rejeu BullMQ.';
      this.stockageReplayNotification.terminer(
        job.identifiantNotification,
        entree.identifiantReplay,
        false,
        message,
      );
      await this.portMonitoringNotification.enregistrerSignal('notifications.replay.failed', {
        notificationId: job.identifiantNotification,
        replayId: entree.identifiantReplay,
        erreur: message,
      });

      return {
        identifiantNotification: job.identifiantNotification,
        identifiantReplay: entree.identifiantReplay,
        succes: false,
        message,
        horodatage: new Date(),
      };
    }
  }
}
