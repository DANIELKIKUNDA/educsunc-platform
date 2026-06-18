import { FabriqueBullMqShared } from 'shared/infrastructure/queues/bullmq';
import { PortFileReplayNotification } from '../../application';
import { ConfigurationFilesNotificationsBullMq } from './ConfigurationFilesNotificationsBullMq';
import { FileNotificationsBullMq } from './FileNotificationsBullMq';
import { MappeurJobNotificationsBullMq } from './MappeurJobNotificationsBullMq';
import { ChargeJobNotificationBullMq } from './TypesJobsNotificationsBullMq';
import { JobFileNotification } from './TypesFilesNotifications';

// Ce fichier implemente la file replay Notifications sur le socle BullMQ partage.

/** Cette classe relie la file de replay au backend BullMQ partage. */
export class FileReplayNotificationsBullMq extends FileNotificationsBullMq implements PortFileReplayNotification {
  /** Ce constructeur relie la file replay a la fabrique BullMQ partagee. */
  constructor(fabriqueBullMqShared = new FabriqueBullMqShared()) {
    super(fabriqueBullMqShared);
    this.queue = fabriqueBullMqShared.creerQueue<ChargeJobNotificationBullMq>(
      ConfigurationFilesNotificationsBullMq.creerReplay(),
    );
  }

  protected override queue;

  /** Cette methode enfile une notification pour replay technique. */
  public override async ajouter(
    identifiantNotification: string,
    metadata: Readonly<Record<string, unknown>> = {},
  ): Promise<void> {
    await this.queue.ajouter(
      'notification.replay',
      MappeurJobNotificationsBullMq.versCharge('REPLAY', identifiantNotification, metadata),
    );
  }

  /** Cette methode retire le prochain job replay disponible. */
  public override async extraireProchainDisponible(): Promise<JobFileNotification | null> {
    const job = await this.queue.extraireProchainDisponible();
    return job ? this.convertir(job) : null;
  }
}
