import { PortFileRetryNotification } from '../../application';
import { RegistreFilesNotifications } from './RegistreFilesNotifications';
import { JobFileNotification } from './TypesFilesNotifications';
import { FileNotifications } from './FileNotifications';

// Ce fichier implemente la file technique de retry Notifications.

/** Cette classe gere la file de retry du moteur Notifications. */
export class FileRetryNotifications extends FileNotifications implements PortFileRetryNotification {
  /** Ce constructeur relie la file de retry au registre memoire partage. */
  constructor(registreFilesNotifications: RegistreFilesNotifications) {
    super(registreFilesNotifications);
  }

  /** Cette methode enfile une notification pour retry technique. */
  public override async ajouter(
    identifiantNotification: string,
    metadata: Readonly<Record<string, unknown>> = {},
  ): Promise<void> {
    const delaiMs = (metadata.delaiRetryMs as number | undefined) ?? 0;
    const tentative = (metadata.tentative as number | undefined) ?? 0;
    this.registreFilesNotifications.obtenirFile('RETRY').push(
      this.construireJob('RETRY', identifiantNotification, metadata, tentative, delaiMs),
    );
  }

  /** Cette methode retire le prochain job retry disponible. */
  public extraireProchainDisponible(): JobFileNotification | null {
    const file = this.registreFilesNotifications.obtenirFile('RETRY');
    const maintenant = Date.now();
    const index = file.findIndex((job) => job.disponibleLe.getTime() <= maintenant);
    if (index < 0) {
      return null;
    }
    const [job] = file.splice(index, 1);
    return job ?? null;
  }
}
