import type { MonitoringContextInputDto } from '../../application';
import type { EtatDependance } from '../../domain';
import { CollecteurEtatDependancesMonitoring } from '../../infrastructure';

// Ce fichier declare le runtime de sante dependances.

export class RuntimeDependencyHealthMonitoring {
  constructor(private readonly collecteur = new CollecteurEtatDependancesMonitoring()) {}

  public async collecter(contexte: MonitoringContextInputDto): Promise<readonly EtatDependance[]> {
    return this.collecteur.collecter(contexte);
  }
}
