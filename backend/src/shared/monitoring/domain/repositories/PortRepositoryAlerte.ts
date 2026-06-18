import type { Alerte } from '../entities';
import type { FiltreMonitoring } from '../value-objects';

// Ce fichier declare le port de persistence des alertes.

/** Cette interface represente le repository domaine des alertes. */
export interface PortRepositoryAlerte {
  sauvegarder(alerte: Alerte): Promise<void> | void;
  rechercherParFiltre(filtre: FiltreMonitoring): Promise<readonly Alerte[]> | readonly Alerte[];
}
