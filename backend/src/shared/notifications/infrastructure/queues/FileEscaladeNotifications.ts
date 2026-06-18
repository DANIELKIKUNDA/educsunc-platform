import { PortFileEscaladeNotification } from '../../application';
import { RegistreFilesNotifications } from './RegistreFilesNotifications';
import { JobFileNotification } from './TypesFilesNotifications';
import { FileNotifications } from './FileNotifications';

// Ce fichier implemente la file technique d'escalade Notifications.

/** Cette classe gere la file d'escalade du moteur Notifications. */
export class FileEscaladeNotifications extends FileNotifications implements PortFileEscaladeNotification {
  /** Ce constructeur relie la file d'escalade au registre memoire partage. */
  constructor(registreFilesNotifications: RegistreFilesNotifications) {
    super(registreFilesNotifications);
  }

  /** Cette methode enfile une notification pour escalation technique. */
  public override async ajouter(
    identifiantNotification: string,
    metadata: Readonly<Record<string, unknown>> = {},
  ): Promise<void> {
    this.registreFilesNotifications.obtenirFile('ESCALADE').push(
      this.construireJob('ESCALADE', identifiantNotification, metadata),
    );
  }

  /** Cette methode retire le prochain job d'escalade disponible. */
  public extraireProchainDisponible(): JobFileNotification | null {
    const file = this.registreFilesNotifications.obtenirFile('ESCALADE');
    const index = file.findIndex(() => true);
    if (index < 0) {
      return null;
    }
    const [job] = file.splice(index, 1);
    return job ?? null;
  }
}
