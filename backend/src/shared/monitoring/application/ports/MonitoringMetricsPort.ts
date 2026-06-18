import type { CapaciteSysteme, MetriqueMetier, MetriqueTechnique, Saturation } from '../../domain';

// Ce fichier declare le port applicatif de gestion des metriques.

/** Cette interface represente le pont vers les metriques et indicateurs. */
export interface MonitoringMetricsPort {
  enregistrerMetriqueMetier(metrique: MetriqueMetier): Promise<void>;
  enregistrerMetriqueTechnique(metrique: MetriqueTechnique): Promise<void>;
  enregistrerCapacite(capacite: CapaciteSysteme): Promise<void>;
  enregistrerSaturation(saturation: Saturation): Promise<void>;
  listerCapacites(): Promise<readonly CapaciteSysteme[]>;
  listerSaturations(): Promise<readonly Saturation[]>;
}
