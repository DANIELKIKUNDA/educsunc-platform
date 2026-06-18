import { MetriqueMetier, MetriqueTechnique } from '../entities';
import type { ValeurMetriqueProps } from '../value-objects';

// Ce fichier declare le service d agregation de metriques.

/** Cette interface represente le resultat d une agregation simple. */
export interface ResultatAggregationMetrique {
  readonly minimum: number;
  readonly maximum: number;
  readonly moyenne: number;
  readonly total: number;
  readonly nombreMesures: number;
}

/** Cette classe represente le service d agregation des metriques. */
export class ServiceAgregationMetriques {
  /** Cette methode agrege des mesures brutes. */
  public agreger(
    metriques: readonly (MetriqueMetier | MetriqueTechnique)[],
  ): ResultatAggregationMetrique {
    const mesures = metriques.map((metrique) => this.extraireValeur(metrique).valeur);
    if (mesures.length === 0) {
      return {
        minimum: 0,
        maximum: 0,
        moyenne: 0,
        total: 0,
        nombreMesures: 0,
      };
    }

    const total = mesures.reduce((somme, mesure) => somme + mesure, 0);
    return {
      minimum: Math.min(...mesures),
      maximum: Math.max(...mesures),
      moyenne: total / mesures.length,
      total,
      nombreMesures: mesures.length,
    };
  }

  /** Cette methode extrait la mesure brute d une metrique. */
  private extraireValeur(metrique: MetriqueMetier | MetriqueTechnique): ValeurMetriqueProps {
    return metrique.valeur().valeur;
  }
}
