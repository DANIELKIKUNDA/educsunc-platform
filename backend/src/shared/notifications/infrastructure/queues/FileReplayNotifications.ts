import { PortFileReplayNotification } from '../../application';
import { RegistreFilesNotifications } from './RegistreFilesNotifications';
import { JobFileNotification } from './TypesFilesNotifications';
import { FileNotifications } from './FileNotifications';

// Ce fichier implemente la file technique de replay Notifications.

/** Cette classe gere la file de replay technique du moteur Notifications. */
export class FileReplayNotifications extends FileNotifications implements PortFileReplayNotification {
  /** Ce constructeur relie la file de replay au registre memoire partage. */
  constructor(registreFilesNotifications: RegistreFilesNotifications) {
    super(registreFilesNotifications);
  }

  /** Cette methode enfile une notification pour replay technique. */
  public override async ajouter(
    identifiantNotification: string,
    metadata: Readonly<Record<string, unknown>> = {},
  ): Promise<void> {
    this.registreFilesNotifications.obtenirFile('REPLAY').push(
      this.construireJob('REPLAY', identifiantNotification, metadata),
    );
  }

  /** Cette methode retire le prochain job replay disponible. */
  public extraireProchainDisponible(): JobFileNotification | null {
    const file = this.registreFilesNotifications.obtenirFile('REPLAY');
    const index = file.findIndex(() => true);
    if (index < 0) {
      return null;
    }
    const [job] = file.splice(index, 1);
    return job ?? null;
  }
}
