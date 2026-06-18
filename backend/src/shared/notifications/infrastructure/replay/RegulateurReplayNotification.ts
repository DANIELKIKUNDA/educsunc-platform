import { FileReplayNotifications } from '../queues';
import { JobFileNotification } from '../queues';

// Ce fichier regule l'execution technique des rejeux Notifications.

/** Cette classe applique une politique simple de pacing sur la file de rejeu. */
export class RegulateurReplayNotification {
  /** Ce constructeur relie le regulateur a la file de rejeu. */
  constructor(
    private readonly fileReplayNotifications: FileReplayNotifications,
    private readonly maximumParCycle = 10,
  ) {}

  /** Cette methode extrait un lot raisonnable de jobs de rejeu disponibles. */
  public preleverLot(): JobFileNotification[] {
    const lot: JobFileNotification[] = [];
    while (lot.length < this.maximumParCycle) {
      const job = this.fileReplayNotifications.extraireProchainDisponible();
      if (job === null) {
        break;
      }
      lot.push(job);
    }
    return lot;
  }
}
