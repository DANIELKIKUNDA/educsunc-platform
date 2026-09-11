import {
  ContratQueueBullMqShared,
  FabriqueBullMqShared,
  SnapshotQueueBullMqShared,
} from 'shared/infrastructure/queues/bullmq';
import { ConfigurationFilesNotificationsBullMq } from './ConfigurationFilesNotificationsBullMq';
import { ChargeDeadLetterNotificationBullMq } from './TypesJobsNotificationsBullMq';
import { JobDeadLetterNotification, JobFileNotification } from './TypesFilesNotifications';
import { MappeurJobNotificationsBullMq } from './MappeurJobNotificationsBullMq';

export interface PortPersistanceDeadLetterNotification {
  sauvegarder(job: JobDeadLetterNotification): Promise<void>;
  marquerRecuperee(identifiantJob: string): Promise<void>;
}

// Ce fichier implemente la dead-letter queue Notifications sur le socle BullMQ partage.

/** Cette classe centralise le placement et la reprise des dead letters via BullMQ. */
export class FileDeadLetterNotificationsBullMq {
  private readonly queue: ContratQueueBullMqShared<ChargeDeadLetterNotificationBullMq>;
  private readonly historiques: JobDeadLetterNotification[] = [];

  /** Ce constructeur relie la DLQ a la fabrique BullMQ partagee. */
  constructor(
    fabriqueBullMqShared = new FabriqueBullMqShared(),
    private readonly persistance?: PortPersistanceDeadLetterNotification,
  ) {
    this.queue = fabriqueBullMqShared.creerQueue<ChargeDeadLetterNotificationBullMq>(
      ConfigurationFilesNotificationsBullMq.creerDeadLetter(),
    );
  }

  /** Cette methode place un job technique dans la dead-letter queue. */
  public async placer(job: JobFileNotification, raisonDeadLetter: string): Promise<void> {
    const charge = MappeurJobNotificationsBullMq.versDeadLetter(job, raisonDeadLetter);
    const jobShared = await this.queue.ajouter('notification.dead-letter', charge);
    const deadLetter = MappeurJobNotificationsBullMq.depuisDeadLetterShared(jobShared);
    this.historiques.push(deadLetter);
    await this.persistance?.sauvegarder(deadLetter);
  }

  /** Cette methode retourne toutes les dead letters connues localement. */
  public lireToutes(): JobDeadLetterNotification[] {
    return [...this.historiques];
  }

  /** Cette methode retire la prochaine dead letter disponible pour recovery. */
  public async extraireProchaine(): Promise<JobDeadLetterNotification | null> {
    const job = await this.queue.extraireProchainDisponible();
    if (!job) return null;
    const deadLetter = MappeurJobNotificationsBullMq.depuisDeadLetterShared(job);
    await this.persistance?.marquerRecuperee(deadLetter.identifiantJob);
    return deadLetter;
  }

  /** Cette methode retourne le snapshot technique courant de la dead-letter queue BullMQ. */
  public observerQueue(): SnapshotQueueBullMqShared {
    return this.queue.observer();
  }
}
