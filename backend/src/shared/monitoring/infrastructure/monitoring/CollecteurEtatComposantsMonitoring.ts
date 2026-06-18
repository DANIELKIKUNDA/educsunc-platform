import { EtatComposant } from '../../domain';
import type { MonitoringContextInputDto } from '../../application';

// Ce fichier declare le collecteur local des etats de composants.

/** Cette classe represente le collecteur memoire des composants observes. */
export class CollecteurEtatComposantsMonitoring {
  /** Cette methode collecte les etats de composants a partir du contexte. */
  public async collecter(contexte: MonitoringContextInputDto): Promise<readonly EtatComposant[]> {
    return [
      new EtatComposant({
        nom: contexte.composant ?? contexte.module ?? 'monitoring-core',
        niveau: 'HEALTHY',
        message: 'Collecte locale active',
        latenceMillisecondes: 5,
        dernierControleLe: new Date(),
        contexte: { ...contexte },
      }),
    ];
  }
}
