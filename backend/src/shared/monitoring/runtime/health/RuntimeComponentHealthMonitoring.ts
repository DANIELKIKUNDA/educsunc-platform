import type { MonitoringContextInputDto } from '../../application';
import type { EtatComposant } from '../../domain';
import { CollecteurEtatComposantsMonitoring } from '../../infrastructure';

// Ce fichier declare le runtime de sante composants.

export class RuntimeComponentHealthMonitoring {
  constructor(private readonly collecteur = new CollecteurEtatComposantsMonitoring()) {}

  public async collecter(contexte: MonitoringContextInputDto): Promise<readonly EtatComposant[]> {
    return this.collecteur.collecter(contexte);
  }
}
