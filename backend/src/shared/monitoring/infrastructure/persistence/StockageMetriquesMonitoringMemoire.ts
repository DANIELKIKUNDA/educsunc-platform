import type {
  CapaciteSysteme,
  MetriqueMetier,
  MetriqueTechnique,
  Saturation,
} from '../../domain';
import type {
  EntreeStockageCapaciteMonitoring,
  EntreeStockageMetriqueMonitoring,
  EntreeStockageSaturationMonitoring,
} from './TypesPersistenceMonitoring';

// Ce fichier declare le stockage memoire des metriques Monitoring.

/** Cette classe represente le stockage local des metriques et projections derivees. */
export class StockageMetriquesMonitoringMemoire {
  private readonly metriques = new Map<string, EntreeStockageMetriqueMonitoring>();
  private readonly capacites = new Map<string, EntreeStockageCapaciteMonitoring>();
  private readonly saturations = new Map<string, EntreeStockageSaturationMonitoring>();

  /** Cette methode enregistre une metrique metier. */
  public enregistrerMetriqueMetier(metrique: MetriqueMetier): void {
    const cle = `business:${metrique.valeur().agregat}:${metrique.valeur().nom}:${Date.now()}`;
    this.metriques.set(cle, { cle, metrique, sauvegardeLe: new Date() });
  }

  /** Cette methode enregistre une metrique technique. */
  public enregistrerMetriqueTechnique(metrique: MetriqueTechnique): void {
    const cle = `technical:${metrique.valeur().source}:${metrique.valeur().nom}:${Date.now()}`;
    this.metriques.set(cle, { cle, metrique, sauvegardeLe: new Date() });
  }

  /** Cette methode enregistre une capacite calculee. */
  public enregistrerCapacite(capacite: CapaciteSysteme): void {
    this.capacites.set(capacite.valeur().ressource, {
      capacite,
      sauvegardeLe: new Date(),
    });
  }

  /** Cette methode enregistre une saturation calculee. */
  public enregistrerSaturation(saturation: Saturation): void {
    this.saturations.set(saturation.valeur().ressource, {
      saturation,
      sauvegardeLe: new Date(),
    });
  }

  /** Cette methode retourne toutes les metriques stockees. */
  public listerMetriques(): readonly (MetriqueMetier | MetriqueTechnique)[] {
    return [...this.metriques.values()].map((entree) => entree.metrique);
  }

  /** Cette methode retourne toutes les capacites stockees. */
  public listerCapacites(): readonly CapaciteSysteme[] {
    return [...this.capacites.values()].map((entree) => entree.capacite);
  }

  /** Cette methode retourne toutes les saturations stockees. */
  public listerSaturations(): readonly Saturation[] {
    return [...this.saturations.values()].map((entree) => entree.saturation);
  }
}
