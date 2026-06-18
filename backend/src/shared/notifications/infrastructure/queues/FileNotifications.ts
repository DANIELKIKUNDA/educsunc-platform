import { randomUUID } from 'node:crypto';
import { PortFileDispatchNotification } from '../../application';
import { RegistreFilesNotifications } from './RegistreFilesNotifications';
import { JobFileNotification } from './TypesFilesNotifications';

// Ce fichier implemente la file technique principale de diffusion Notifications.

/** Cette classe gere la file de dispatch principale du moteur Notifications. */
export class FileNotifications implements PortFileDispatchNotification {
  /** Ce constructeur relie la file au registre memoire partage. */
  constructor(protected readonly registreFilesNotifications: RegistreFilesNotifications) {}

  /** Cette methode enfile une notification pour diffusion principale. */
  public async ajouter(
    identifiantNotification: string,
    metadata: Readonly<Record<string, unknown>> = {},
  ): Promise<void> {
    this.registreFilesNotifications.obtenirFile('DISPATCH').push(
      this.construireJob('DISPATCH', identifiantNotification, metadata),
    );
  }

  /** Cette methode expose le prochain job disponible sans le retirer. */
  public lireProchainDisponible(): JobFileNotification | null {
    const maintenant = Date.now();
    return this.registreFilesNotifications
      .obtenirFile('DISPATCH')
      .find((job) => job.disponibleLe.getTime() <= maintenant) ?? null;
  }

  /** Cette methode retire le prochain job disponible. */
  public extraireProchainDisponible(): JobFileNotification | null {
    const file = this.registreFilesNotifications.obtenirFile('DISPATCH');
    const maintenant = Date.now();
    const index = file.findIndex((job) => job.disponibleLe.getTime() <= maintenant);
    if (index < 0) {
      return null;
    }
    const [job] = file.splice(index, 1);
    return job ?? null;
  }

  /** Cette methode construit un job technique standardise. */
  protected construireJob(
    typeFile: JobFileNotification['typeFile'],
    identifiantNotification: string,
    metadata: Readonly<Record<string, unknown>>,
    tentative = 0,
    delaiMs = 0,
  ): JobFileNotification {
    return {
      identifiantJob: randomUUID(),
      identifiantNotification,
      typeFile,
      organisationId: metadata.organisationId as string | undefined,
      ecoleId: metadata.ecoleId as string | undefined,
      correlationId: metadata.correlationId as string | undefined,
      requestId: metadata.requestId as string | undefined,
      priorite: metadata.prioriteJob as JobFileNotification['priorite'] | undefined,
      metadata: { ...metadata },
      tentative,
      creeLe: new Date(),
      disponibleLe: new Date(Date.now() + delaiMs),
    };
  }
}
