import { FileRetryNotifications, JobFileNotification } from '../queues';

// Ce fichier regule l'execution technique des retries Notifications.

/** Cette classe applique une politique simple de pacing sur la file de retry. */
export class RegulateurRetryNotification {
  /** Ce constructeur relie le regulateur a la file de retry. */
  constructor(
    private readonly fileRetryNotifications: FileRetryNotifications,
    private readonly maximumParCycle = 10,
  ) {}

  /** Cette methode extrait un lot de jobs retry disponibles. */
  public preleverLot(): JobFileNotification[] {
    const lot: JobFileNotification[] = [];
    while (lot.length < this.maximumParCycle) {
      const job = this.fileRetryNotifications.extraireProchainDisponible();
      if (job === null) {
        break;
      }
      lot.push(job);
    }
    return lot;
  }
}
