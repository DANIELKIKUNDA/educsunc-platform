import { EnregistrementNotificationMemoire } from '../persistence';
import { EnregistrementArchiveNotification } from './TypesStockageNotifications';

// Ce fichier heberge le stockage archive des notifications.

/** Cette classe centralise l'archivage logique des notifications. */
export class StockageArchiveNotifications {
  private readonly archives = new Map<string, EnregistrementArchiveNotification>();

  /** Cette methode archive un snapshot de notification avec sa raison. */
  public archiver(
    enregistrement: EnregistrementNotificationMemoire,
    raisonArchivage?: string,
  ): EnregistrementArchiveNotification {
    const archive: EnregistrementArchiveNotification = {
      identifiantNotification: enregistrement.identifiant,
      organisationId: enregistrement.organisationId,
      ecoleId: enregistrement.ecoleId,
      snapshot: enregistrement,
      archiveLe: new Date(),
      raisonArchivage,
    };
    this.archives.set(enregistrement.identifiant, archive);
    return archive;
  }

  /** Cette methode lit une archive par identifiant notification. */
  public lire(identifiantNotification: string): EnregistrementArchiveNotification | null {
    return this.archives.get(identifiantNotification) ?? null;
  }

  /** Cette methode liste toutes les archives connues. */
  public listerToutes(): EnregistrementArchiveNotification[] {
    return [...this.archives.values()];
  }
}
