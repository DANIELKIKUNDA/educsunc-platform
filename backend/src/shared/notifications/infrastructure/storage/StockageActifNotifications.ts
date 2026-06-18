import { EnregistrementNotificationMemoire } from '../persistence';

// Ce fichier heberge le stockage actif des notifications.

/** Cette classe centralise les snapshots actifs utilises par le moteur Notifications. */
export class StockageActifNotifications {
  private readonly actifs = new Map<string, EnregistrementNotificationMemoire>();

  /** Cette methode enregistre ou remplace un snapshot actif. */
  public enregistrer(enregistrement: EnregistrementNotificationMemoire): void {
    this.actifs.set(enregistrement.identifiant, enregistrement);
  }

  /** Cette methode lit un snapshot actif par identifiant notification. */
  public lire(identifiantNotification: string): EnregistrementNotificationMemoire | null {
    return this.actifs.get(identifiantNotification) ?? null;
  }

  /** Cette methode retire un snapshot actif du stockage chaud. */
  public retirer(identifiantNotification: string): EnregistrementNotificationMemoire | null {
    const enregistrement = this.actifs.get(identifiantNotification) ?? null;
    this.actifs.delete(identifiantNotification);
    return enregistrement;
  }

  /** Cette methode retourne tous les snapshots actifs connus. */
  public listerTous(): EnregistrementNotificationMemoire[] {
    return [...this.actifs.values()];
  }
}
