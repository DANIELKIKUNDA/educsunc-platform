import { FabriqueBullMqShared } from 'shared/infrastructure/queues/bullmq';
import { PortFileRetryNotification } from '../../application';
import { ConfigurationFilesNotificationsBullMq } from './ConfigurationFilesNotificationsBullMq';
import { FileNotificationsBullMq } from './FileNotificationsBullMq';
import { MappeurJobNotificationsBullMq } from './MappeurJobNotificationsBullMq';
import { ChargeJobNotificationBullMq } from './TypesJobsNotificationsBullMq';
import { JobFileNotification } from './TypesFilesNotifications';

// Ce fichier implemente la file retry Notifications sur le socle BullMQ partage.

/** Cette classe relie la file de retry au backend BullMQ partage. */
export class FileRetryNotificationsBullMq extends FileNotificationsBullMq implements PortFileRetryNotification {
  /** Ce constructeur relie la file retry a la fabrique BullMQ partagee. */
  constructor(fabriqueBullMqShared = new FabriqueBullMqShared()) {
    super(fabriqueBullMqShared);
    this.queue = fabriqueBullMqShared.creerQueue<ChargeJobNotificationBullMq>(
      ConfigurationFilesNotificationsBullMq.creerRetry(),
    );
  }

  protected override queue;

  /** Cette methode enfile une notification pour retry technique. */
  public override async ajouter(
    identifiantNotification: string,
    metadata: Readonly<Record<string, unknown>> = {},
  ): Promise<void> {
    const tentative = (metadata.tentative as number | undefined) ?? 0;
    const delaiMs = (metadata.delaiRetryMs as number | undefined) ?? 0;
    await this.queue.ajouter(
      'notification.retry',
      MappeurJobNotificationsBullMq.versCharge(
        'RETRY',
        identifiantNotification,
        metadata,
        tentative,
        delaiMs,
      ),
      {
        tentative,
        delaiMs,
      },
    );
  }

  /** Cette methode retire le prochain job retry disponible. */
  public override async extraireProchainDisponible(): Promise<JobFileNotification | null> {
    const job = await this.queue.extraireProchainDisponible();
    return job ? this.convertir(job) : null;
  }
}
