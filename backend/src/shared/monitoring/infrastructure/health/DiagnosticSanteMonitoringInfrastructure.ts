import { HealthcheckMonitoringInfrastructure } from './HealthcheckMonitoringInfrastructure';
import type { MonitoringContextInputDto } from '../../application';
import type { EtatRuntimeProps } from '../../domain';

// Ce fichier declare le diagnostic local de sante infrastructure.

/** Cette classe represente un diagnostic technique local de sante. */
export class DiagnosticSanteMonitoringInfrastructure {
  constructor(private readonly healthcheck = new HealthcheckMonitoringInfrastructure()) {}

  /** Cette methode produit un diagnostic simple du module. */
  public async diagnostiquer(contexte: MonitoringContextInputDto): Promise<{
    readonly composants: number;
    readonly dependances: number;
    readonly runtime: EtatRuntimeProps;
  }> {
    const composants = await this.healthcheck.collecterComposants(contexte);
    const dependances = await this.healthcheck.collecterDependances(contexte);
    const runtime = await this.healthcheck.collecterRuntime(contexte);
    return {
      composants: composants.length,
      dependances: dependances.length,
      runtime: runtime.valeur(),
    };
  }
}
