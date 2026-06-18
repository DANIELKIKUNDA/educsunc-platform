import { EtatDependance } from '../../domain';
import type { MonitoringContextInputDto } from '../../application';

// Ce fichier declare le collecteur local des dependances.

/** Cette classe represente le collecteur memoire des dependances observees. */
export class CollecteurEtatDependancesMonitoring {
  /** Cette methode collecte les dependances techniques du module. */
  public async collecter(_contexte: MonitoringContextInputDto): Promise<readonly EtatDependance[]> {
    return [
      new EtatDependance({
        nom: 'memoire-locale',
        source: 'RUNTIME',
        niveau: 'HEALTHY',
        disponible: true,
        message: 'Stockage local disponible',
        verifieLe: new Date(),
      }),
    ];
  }
}
