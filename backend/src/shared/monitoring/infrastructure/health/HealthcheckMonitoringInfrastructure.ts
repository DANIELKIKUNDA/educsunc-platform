import type { MonitoringHealthPort, MonitoringContextInputDto } from '../../application';
import type { EtatComposant, EtatDependance, EtatRuntime } from '../../domain';
import {
  CollecteurEtatComposantsMonitoring,
  CollecteurEtatDependancesMonitoring,
  CollecteurEtatRuntimeMonitoring,
} from '../monitoring';

// Ce fichier declare l adapter de healthcheck local Monitoring.

/** Cette classe represente le port de sante branche sur les collecteurs locaux. */
export class HealthcheckMonitoringInfrastructure implements MonitoringHealthPort {
  constructor(
    private readonly composants = new CollecteurEtatComposantsMonitoring(),
    private readonly dependances = new CollecteurEtatDependancesMonitoring(),
    private readonly runtime = new CollecteurEtatRuntimeMonitoring(),
  ) {}

  /** Cette methode collecte les composants. */
  public async collecterComposants(contexte: MonitoringContextInputDto): Promise<readonly EtatComposant[]> {
    return this.composants.collecter(contexte);
  }

  /** Cette methode collecte les dependances. */
  public async collecterDependances(contexte: MonitoringContextInputDto): Promise<readonly EtatDependance[]> {
    return this.dependances.collecter(contexte);
  }

  /** Cette methode collecte le runtime. */
  public async collecterRuntime(contexte: MonitoringContextInputDto): Promise<EtatRuntime> {
    return this.runtime.collecter(contexte);
  }
}
