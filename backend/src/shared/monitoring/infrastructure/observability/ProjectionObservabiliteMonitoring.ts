import type { SignalSysteme } from '../../domain';

// Ce fichier declare la projection locale d observabilite.

/** Cette classe represente une projection locale des signaux d observabilite. */
export class ProjectionObservabiliteMonitoring {
  constructor(private readonly signaux: readonly SignalSysteme[] = []) {}

  /** Cette methode retourne un snapshot simple des signaux collectes. */
  public snapshot(): {
    readonly totalSignaux: number;
    readonly derniersTypes: readonly string[];
  } {
    return {
      totalSignaux: this.signaux.length,
      derniersTypes: this.signaux.slice(-10).map((signal) => signal.valeur().type),
    };
  }
}
