import { EnregistrementNotificationMemoire } from '../persistence';
import { EntreeReplayNotification } from '../replay';
import { EnregistrementForensicNotification } from './TypesStockageNotifications';

// Ce fichier heberge le stockage forensic des notifications.

/** Cette classe consolide les donnees forensic utiles aux investigations futures. */
export class StockageForensicNotifications {
  private readonly enregistrements = new Map<string, EnregistrementForensicNotification>();

  /** Cette methode reconstruit ou met a jour une vue forensic pour une notification. */
  public enregistrer(
    enregistrement: EnregistrementNotificationMemoire,
    chronologyCount: number,
    historiquesReplay: readonly EntreeReplayNotification[] = [],
  ): EnregistrementForensicNotification {
    const vue: EnregistrementForensicNotification = {
      identifiantNotification: enregistrement.identifiant,
      correlationId: enregistrement.correlationId,
      requestId: enregistrement.requestId,
      organisationId: enregistrement.organisationId,
      ecoleId: enregistrement.ecoleId,
      chronologyCount,
      totalRetries: enregistrement.compteurRetry,
      totalReplays: historiquesReplay.length,
      misAJourLe: new Date(),
    };
    this.enregistrements.set(enregistrement.identifiant, vue);
    return vue;
  }

  /** Cette methode lit une vue forensic par identifiant notification. */
  public lire(identifiantNotification: string): EnregistrementForensicNotification | null {
    return this.enregistrements.get(identifiantNotification) ?? null;
  }

  /** Cette methode liste toutes les vues forensic connues. */
  public listerTous(): EnregistrementForensicNotification[] {
    return [...this.enregistrements.values()];
  }
}
