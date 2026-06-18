import type { MonitoringContextInputDto } from '../../application';
import { DiagnosticSanteMonitoringInfrastructure } from '../../infrastructure';

// Ce fichier declare le runtime de diagnostics Monitoring.

export class RuntimeDiagnosticsMonitoring {
  constructor(private readonly diagnostic = new DiagnosticSanteMonitoringInfrastructure()) {}

  public async executer(contexte: MonitoringContextInputDto): Promise<{
    readonly composants: number;
    readonly dependances: number;
    readonly runtime: import('../../domain').EtatRuntimeProps;
  }> {
    return this.diagnostic.diagnostiquer(contexte);
  }
}
