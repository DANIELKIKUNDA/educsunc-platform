import type { Alerte, FiltreMonitoring, PortRepositoryAlerte } from '../../domain';
import type { MonitoringAlertPort } from '../../application';
import { StockageAlertesMonitoringMemoire } from '../persistence';

// Ce fichier declare le repository memoire des alertes Monitoring.

/** Cette classe represente l implementation memoire des alertes. */
export class RepositoryAlerteMonitoringMemoire implements PortRepositoryAlerte, MonitoringAlertPort {
  constructor(private readonly stockage = new StockageAlertesMonitoringMemoire()) {}

  /** Cette methode persiste une alerte dans le stockage local. */
  public async sauvegarder(alerte: Alerte): Promise<void> {
    this.stockage.enregistrer(alerte);
  }

  /** Cette methode recherche des alertes selon un filtre simple. */
  public async rechercherParFiltre(_filtre: FiltreMonitoring): Promise<readonly Alerte[]> {
    return this.stockage.lister();
  }

  /** Cette methode enregistre une alerte via le port applicatif. */
  public async enregistrerAlerte(alerte: Alerte): Promise<void> {
    await this.sauvegarder(alerte);
  }

  /** Cette methode retrouve une alerte par identifiant. */
  public async retrouverAlerte(alertId: string): Promise<Alerte | null> {
    return this.stockage.lire(alertId);
  }

  /** Cette methode liste les alertes stockees. */
  public async listerAlertes(): Promise<readonly Alerte[]> {
    return this.stockage.lister();
  }

  /** Cette methode expose le stockage sous-jacent. */
  public stockageMemoire(): StockageAlertesMonitoringMemoire {
    return this.stockage;
  }
}
