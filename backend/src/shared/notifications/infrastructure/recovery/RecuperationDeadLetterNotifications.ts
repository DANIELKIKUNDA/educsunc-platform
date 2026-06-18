// Ce fichier declare la recuperation technique de la dead-letter queue Notifications.

import { PortFileReplayNotification } from '../../application';
import { FileDeadLetterNotifications, JobDeadLetterNotification } from '../queues';
import { OperationRecuperationNotification } from './TypesRecuperationNotifications';

/** Cette classe prend en charge la reprise technique locale des jobs dead-letterises. */
export class RecuperationDeadLetterNotifications {
  /** Ce constructeur relie la recuperation a la DLQ et a la file de replay. */
  constructor(
    private readonly fileDeadLetterNotifications: FileDeadLetterNotifications,
    private readonly portFileReplayNotification: PortFileReplayNotification,
  ) {}

  /** Cette methode rehydrate un nombre limite de dead letters dans la file de replay. */
  public async rejouerDepuisDeadLetter(limite = 25): Promise<OperationRecuperationNotification> {
    const jobsRecuperes: JobDeadLetterNotification[] = [];

    while (jobsRecuperes.length < limite) {
      const job = this.fileDeadLetterNotifications.extraireProchaine();
      if (!job) {
        break;
      }

      jobsRecuperes.push(job);
      await this.portFileReplayNotification.ajouter(job.identifiantNotification, {
        provenance: 'dead-letter-recovery',
        identifiantJobSource: job.identifiantJob,
        raisonDeadLetter: job.raisonDeadLetter,
      });
    }

    return {
      cible: 'DEAD_LETTER',
      succes: true,
      recupereLe: new Date(),
      elementsTraites: jobsRecuperes.length,
      metadata: {
        limite,
      },
    };
  }

  /** Cette methode retourne le nombre de dead letters actuellement en attente. */
  public observerEnAttente(): OperationRecuperationNotification {
    const total = this.fileDeadLetterNotifications.lireToutes().length;
    return {
      cible: 'DEAD_LETTER',
      succes: true,
      recupereLe: new Date(),
      elementsTraites: total,
      metadata: {
        mode: 'observation',
      },
    };
  }
}
