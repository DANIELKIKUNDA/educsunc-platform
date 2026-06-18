import { Saturation } from '../entities';

// Ce fichier declare le service de calcul de saturation.

/** Cette classe represente le calculateur de saturation systeme. */
export class ServiceCalculSaturation {
  /** Cette methode calcule une saturation a partir d un taux et de seuils simples. */
  public calculer(ressource: string, taux: number, observeeLe = new Date()): Saturation {
    return new Saturation({
      ressource,
      taux,
      niveau: taux >= 90 ? 'CRITICAL' : taux >= 70 ? 'DEGRADED' : 'HEALTHY',
      goulot: taux >= 95,
      observeeLe,
    });
  }
}
