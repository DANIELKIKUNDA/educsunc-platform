import type { MetriqueMetier, MetriqueTechnique } from '../entities';
import type { FiltreMonitoring } from '../value-objects';

// Ce fichier declare le port de persistence des metriques.

/** Cette interface represente le repository domaine des metriques. */
export interface PortRepositoryMetrique {
  sauvegarderMetriqueMetier(metrique: MetriqueMetier): Promise<void> | void;
  sauvegarderMetriqueTechnique(metrique: MetriqueTechnique): Promise<void> | void;
  rechercherParFiltre(
    filtre: FiltreMonitoring,
  ): Promise<readonly (MetriqueMetier | MetriqueTechnique)[]> | readonly (MetriqueMetier | MetriqueTechnique)[];
}
