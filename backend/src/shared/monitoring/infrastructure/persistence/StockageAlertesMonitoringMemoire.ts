import type { Alerte } from '../../domain';
import type { EntreeStockageAlerteMonitoring } from './TypesPersistenceMonitoring';

// Ce fichier declare le stockage memoire des alertes Monitoring.

/** Cette classe represente le stockage local des alertes. */
export class StockageAlertesMonitoringMemoire {
  private readonly alertes = new Map<string, EntreeStockageAlerteMonitoring>();

  /** Cette methode enregistre une alerte dans le stockage local. */
  public enregistrer(alerte: Alerte): void {
    this.alertes.set(alerte.valeur().identifiant, {
      alerte,
      sauvegardeLe: new Date(),
    });
  }

  /** Cette methode retourne une alerte par identifiant. */
  public lire(identifiant: string): Alerte | null {
    return this.alertes.get(identifiant)?.alerte ?? null;
  }

  /** Cette methode retourne toutes les alertes stockees. */
  public lister(): readonly Alerte[] {
    return [...this.alertes.values()].map((entree) => entree.alerte);
  }
}
