import { FabriqueBullMqShared } from 'shared/infrastructure/queues/bullmq';
import { PortFileEscaladeNotification } from '../../application';
import { ConfigurationFilesNotificationsBullMq } from './ConfigurationFilesNotificationsBullMq';
import { FileNotificationsBullMq } from './FileNotificationsBullMq';
import { MappeurJobNotificationsBullMq } from './MappeurJobNotificationsBullMq';
import { ChargeJobNotificationBullMq } from './TypesJobsNotificationsBullMq';
import { JobFileNotification } from './TypesFilesNotifications';

// Ce fichier implemente la file d escalade Notifications sur le socle BullMQ partage.

/** Cette classe relie la file d escalade au backend BullMQ partage. */
export class FileEscaladeNotificationsBullMq extends FileNotificationsBullMq implements PortFileEscaladeNotification {
  /** Ce constructeur relie la file d escalade a la fabrique BullMQ partagee. */
  constructor(fabriqueBullMqShared = new FabriqueBullMqShared()) {
    super(fabriqueBullMqShared);
    this.queue = fabriqueBullMqShared.creerQueue<ChargeJobNotificationBullMq>(
      ConfigurationFilesNotificationsBullMq.creerEscalade(),
    );
  }

  protected override queue;

  /** Cette methode enfile une notification pour escalade technique. */
  public override async ajouter(
    identifiantNotification: string,
    metadata: Readonly<Record<string, unknown>> = {},
  ): Promise<void> {
    await this.queue.ajouter(
      'notification.escalade',
      MappeurJobNotificationsBullMq.versCharge('ESCALADE', identifiantNotification, metadata),
    );
  }

  /** Cette methode retire le prochain job d escalade disponible. */
  public override async extraireProchainDisponible(): Promise<JobFileNotification | null> {
    const job = await this.queue.extraireProchainDisponible();
    return job ? this.convertir(job) : null;
  }
}
