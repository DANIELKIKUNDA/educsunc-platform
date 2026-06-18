import { CapaciteSysteme } from '../entities';

// Ce fichier declare le service de calcul de capacite.

/** Cette classe represente le calculateur de capacite. */
export class ServiceCalculCapacite {
  /** Cette methode calcule la capacite restante d une ressource. */
  public calculer(
    ressource: string,
    utilisationActuelle: number,
    capaciteMax: number,
    estimeeLe = new Date(),
  ): CapaciteSysteme {
    const margeDisponible = Math.max(0, capaciteMax - utilisationActuelle);
    const ratio = capaciteMax === 0 ? 100 : (utilisationActuelle / capaciteMax) * 100;
    return new CapaciteSysteme({
      ressource,
      utilisationActuelle,
      capaciteMax,
      margeDisponible,
      niveau: ratio >= 90 ? 'CRITICAL' : ratio >= 70 ? 'DEGRADED' : 'HEALTHY',
      estimeeLe,
    });
  }
}
