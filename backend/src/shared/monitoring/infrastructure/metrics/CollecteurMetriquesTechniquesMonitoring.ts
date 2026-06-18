import { MetriqueTechnique, ValeurMetrique } from '../../domain';
import type { MonitoringContextInputDto } from '../../application';

// Ce fichier declare le collecteur local de metriques techniques.

/** Cette classe represente le collecteur memoire des metriques techniques. */
export class CollecteurMetriquesTechniquesMonitoring {
  /** Cette methode collecte un petit lot de metriques techniques locales. */
  public async collecter(contexte: MonitoringContextInputDto): Promise<readonly MetriqueTechnique[]> {
    return [
      new MetriqueTechnique({
        nom: 'runtime_latency',
        source: 'RUNTIME',
        valeur: new ValeurMetrique({
          valeur: 5,
          unite: 'ms',
          horodatage: new Date(),
        }).valeur(),
        contexte: { ...contexte },
      }),
    ];
  }
}
