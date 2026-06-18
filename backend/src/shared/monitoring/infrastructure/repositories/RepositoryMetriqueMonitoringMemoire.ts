import type {
  CapaciteSysteme,
  FiltreMonitoring,
  MetriqueMetier,
  MetriqueTechnique,
  PortRepositoryMetrique,
  Saturation,
} from '../../domain';
import type { MonitoringMetricsPort } from '../../application';
import { StockageMetriquesMonitoringMemoire } from '../persistence';

// Ce fichier declare le repository memoire des metriques Monitoring.

/** Cette classe represente l implementation memoire des metriques et calculs derives. */
export class RepositoryMetriqueMonitoringMemoire implements PortRepositoryMetrique, MonitoringMetricsPort {
  constructor(private readonly stockage = new StockageMetriquesMonitoringMemoire()) {}

  /** Cette methode persiste une metrique metier. */
  public async sauvegarderMetriqueMetier(metrique: MetriqueMetier): Promise<void> {
    this.stockage.enregistrerMetriqueMetier(metrique);
  }

  /** Cette methode persiste une metrique technique. */
  public async sauvegarderMetriqueTechnique(metrique: MetriqueTechnique): Promise<void> {
    this.stockage.enregistrerMetriqueTechnique(metrique);
  }

  /** Cette methode recherche des metriques selon un filtre simple. */
  public async rechercherParFiltre(
    _filtre: FiltreMonitoring,
  ): Promise<readonly (MetriqueMetier | MetriqueTechnique)[]> {
    return this.stockage.listerMetriques();
  }

  /** Cette methode enregistre une metrique metier via le port applicatif. */
  public async enregistrerMetriqueMetier(metrique: MetriqueMetier): Promise<void> {
    await this.sauvegarderMetriqueMetier(metrique);
  }

  /** Cette methode enregistre une metrique technique via le port applicatif. */
  public async enregistrerMetriqueTechnique(metrique: MetriqueTechnique): Promise<void> {
    await this.sauvegarderMetriqueTechnique(metrique);
  }

  /** Cette methode enregistre une capacite calculee. */
  public async enregistrerCapacite(capacite: CapaciteSysteme): Promise<void> {
    this.stockage.enregistrerCapacite(capacite);
  }

  /** Cette methode enregistre une saturation calculee. */
  public async enregistrerSaturation(saturation: Saturation): Promise<void> {
    this.stockage.enregistrerSaturation(saturation);
  }

  /** Cette methode liste les capacites stockees. */
  public async listerCapacites(): Promise<readonly CapaciteSysteme[]> {
    return this.stockage.listerCapacites();
  }

  /** Cette methode liste les saturations stockees. */
  public async listerSaturations(): Promise<readonly Saturation[]> {
    return this.stockage.listerSaturations();
  }

  /** Cette methode expose le stockage sous-jacent. */
  public stockageMemoire(): StockageMetriquesMonitoringMemoire {
    return this.stockage;
  }
}
