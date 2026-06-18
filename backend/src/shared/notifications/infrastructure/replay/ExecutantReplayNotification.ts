import { PortMonitoringNotification } from '../../application';
import { StockageChronologieNotification } from '../chronology';
import { FileReplayNotifications, JobFileNotification } from '../queues';
import { StockageReplayNotification } from './StockageReplayNotification';
import { RegulateurReplayNotification } from './RegulateurReplayNotification';
import { ResultatExecutionReplayNotification } from './TypesReplayNotification';

// Ce fichier execute les rejeux techniques du moteur Notifications.

/** Cette classe consomme la file de rejeu et produit un historique technique stable. */
export class ExecutantReplayNotification {
  /** Ce constructeur assemble les dependances techniques du rejeu. */
  constructor(
    private readonly fileReplayNotifications: FileReplayNotifications,
    private readonly regulateurReplayNotification: RegulateurReplayNotification,
    private readonly stockageReplayNotification: StockageReplayNotification,
    private readonly stockageChronologieNotification: StockageChronologieNotification,
    private readonly portMonitoringNotification: PortMonitoringNotification,
  ) {}

  /** Cette methode execute un cycle de rejeu technique sur un lot disponible. */
  public async executerCycle(): Promise<ResultatExecutionReplayNotification[]> {
    const jobs = this.regulateurReplayNotification.preleverLot();
    const resultats: ResultatExecutionReplayNotification[] = [];

    for (const job of jobs) {
      resultats.push(await this.executerJob(job));
    }

    return resultats;
  }

  /** Cette methode expose la file de rejeu sous-jacente pour les integrations futures. */
  public obtenirFileReplay(): FileReplayNotifications {
    return this.fileReplayNotifications;
  }

  /** Cette methode execute un job unique de rejeu technique. */
  private async executerJob(job: JobFileNotification): Promise<ResultatExecutionReplayNotification> {
    const entree = this.stockageReplayNotification.ouvrir(job.identifiantNotification, job.metadata);

    try {
      if (Boolean(job.metadata.rebatirChronologie)) {
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
        message: 'Rejeu technique execute.',
        horodatage: new Date(),
      };
    } catch (erreur) {
      const message = erreur instanceof Error ? erreur.message : 'Echec technique de rejeu.';
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
