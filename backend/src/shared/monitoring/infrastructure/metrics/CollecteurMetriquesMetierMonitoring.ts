import { MetriqueMetier, ValeurMetrique } from '../../domain';
import type { MonitoringContextInputDto } from '../../application';

// Ce fichier declare le collecteur local de metriques metier.

/** Cette classe represente le collecteur memoire des metriques metier. */
export class CollecteurMetriquesMetierMonitoring {
  /** Cette methode collecte un petit lot de metriques metier locales. */
  public async collecter(contexte: MonitoringContextInputDto): Promise<readonly MetriqueMetier[]> {
    return [
      new MetriqueMetier({
        nom: 'workflow_count',
        agregat: contexte.module ?? 'monitoring',
        valeur: new ValeurMetrique({
          valeur: 1,
          unite: 'count',
          horodatage: new Date(),
        }).valeur(),
        contexte: { ...contexte },
      }),
    ];
  }
}
