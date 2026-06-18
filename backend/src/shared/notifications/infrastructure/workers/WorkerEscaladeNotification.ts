// Ce fichier declare le worker d'escalade technique du moteur Notifications.

import { PortFileDispatchNotification, PortMonitoringNotification } from '../../application';
import { FileDeadLetterNotifications, FileEscaladeNotifications, JobFileNotification } from '../queues';
import {
  DetailExecutionWorkerNotification,
  ResultatExecutionWorkerNotification,
} from './TypesWorkersNotifications';

/** Cette classe consomme la file d'escalade et reprogramme une rediffusion technique. */
export class WorkerEscaladeNotification {
  /** Ce constructeur assemble les dependances techniques d'escalade. */
  constructor(
    private readonly fileEscaladeNotifications: FileEscaladeNotifications,
    private readonly portFileDispatchNotification: PortFileDispatchNotification,
    private readonly fileDeadLetterNotifications: FileDeadLetterNotifications,
    private readonly portMonitoringNotification: PortMonitoringNotification,
  ) {}

  /** Cette methode execute un cycle complet d'escalade sur un lot disponible. */
  public async executerCycle(limite = 25): Promise<ResultatExecutionWorkerNotification> {
    const details: DetailExecutionWorkerNotification[] = [];

    while (details.length < limite) {
      const job = this.fileEscaladeNotifications.extraireProchainDisponible();
      if (!job) {
        break;
      }

      details.push(await this.executerJob(job));
    }

    const totalSucces = details.filter((detail) => detail.succes).length;
    return {
      typeWorker: 'ESCALADE',
      succes: details.every((detail) => detail.succes),
      totalTraites: details.length,
      totalSucces,
      totalEchecs: details.length - totalSucces,
      executeLe: new Date(),
      details,
      metadata: {},
    };
  }

  /** Cette methode execute un job unique d'escalade. */
  private async executerJob(job: JobFileNotification): Promise<DetailExecutionWorkerNotification> {
    try {
      const rediffuser = job.metadata.rediffuser !== false;
      if (rediffuser) {
        await this.portFileDispatchNotification.ajouter(job.identifiantNotification, {
          ...job.metadata,
          origineWorker: 'ESCALADE',
        });
      }

      await this.portMonitoringNotification.enregistrerSignal('notifications.escalation.executed', {
        notificationId: job.identifiantNotification,
        rediffuser,
      });
      return {
        identifiantNotification: job.identifiantNotification,
        succes: true,
        message: rediffuser
          ? 'L escalade a reprogramme une rediffusion technique.'
          : 'L escalade a ete constatee sans rediffusion.',
        metadata: {
          rediffuser,
        },
      };
    } catch (erreur) {
      const message = erreur instanceof Error ? erreur.message : 'Echec technique de l escalade.';
      await this.fileDeadLetterNotifications.placer(job, message);
      await this.portMonitoringNotification.enregistrerSignal('notifications.escalation.failed', {
        notificationId: job.identifiantNotification,
        erreur: message,
      });
      return {
        identifiantNotification: job.identifiantNotification,
        succes: false,
        message,
        metadata: {},
      };
    }
  }
}
