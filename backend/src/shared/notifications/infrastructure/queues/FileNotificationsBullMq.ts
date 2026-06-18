import {
  ContratQueueBullMqShared,
  FabriqueBullMqShared,
  JobBullMqShared,
  SnapshotQueueBullMqShared,
} from 'shared/infrastructure/queues/bullmq';
import { PortFileDispatchNotification } from '../../application';
import { ConfigurationFilesNotificationsBullMq } from './ConfigurationFilesNotificationsBullMq';
import { MappeurJobNotificationsBullMq } from './MappeurJobNotificationsBullMq';
import { ChargeJobNotificationBullMq } from './TypesJobsNotificationsBullMq';
import { JobFileNotification } from './TypesFilesNotifications';

// Ce fichier implemente la file principale Notifications sur le socle BullMQ partage.

/** Cette classe relie la mise en file principale au backend BullMQ partage. */
export class FileNotificationsBullMq implements PortFileDispatchNotification {
  protected readonly queue: ContratQueueBullMqShared<ChargeJobNotificationBullMq>;

  /** Ce constructeur relie la file principale a la fabrique BullMQ partagee. */
  constructor(fabriqueBullMqShared = new FabriqueBullMqShared()) {
    this.queue = fabriqueBullMqShared.creerQueue<ChargeJobNotificationBullMq>(
      ConfigurationFilesNotificationsBullMq.creerDispatch(),
    );
  }

  /** Cette methode enfile une notification pour diffusion principale. */
  public async ajouter(
    identifiantNotification: string,
    metadata: Readonly<Record<string, unknown>> = {},
  ): Promise<void> {
    await this.queue.ajouter(
      'notification.dispatch',
      MappeurJobNotificationsBullMq.versCharge('DISPATCH', identifiantNotification, metadata),
    );
  }

  /** Cette methode expose le prochain job disponible sans le marquer termine. */
  public async lireProchainDisponible(): Promise<JobFileNotification | null> {
    const job = await this.queue.extraireProchainDisponible();
    return job ? MappeurJobNotificationsBullMq.depuisJobShared(job) : null;
  }

  /** Cette methode retire le prochain job disponible pour traitement. */
  public async extraireProchainDisponible(): Promise<JobFileNotification | null> {
    return this.lireProchainDisponible();
  }

  /** Cette methode retourne le snapshot technique courant de la queue BullMQ. */
  public observerQueue(): SnapshotQueueBullMqShared {
    return this.queue.observer();
  }

  /** Cette methode convertit un job partage en contrat Notifications. */
  protected convertir(job: JobBullMqShared<ChargeJobNotificationBullMq>): JobFileNotification {
    return MappeurJobNotificationsBullMq.depuisJobShared(job);
  }
}
