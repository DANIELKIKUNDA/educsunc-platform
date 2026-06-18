import type { GetObservabilitySnapshotQuery } from '../queries';
import type { ObservabilitySnapshotDto } from '../dto/output';
import type { MonitoringIncidentPort, MonitoringMetricsPort, MonitoringTracingPort } from '../ports';
import { ApplicationHealthMonitoringService } from '../services';

// Ce fichier declare le use case de lecture d observabilite.

/** Cette classe orchestre la lecture applicative d observabilite consolidee. */
export class GetObservabilitySnapshotUseCase {
  constructor(
    private readonly healthService: ApplicationHealthMonitoringService,
    private readonly incidentPort: MonitoringIncidentPort,
    private readonly tracingPort: MonitoringTracingPort,
    private readonly metricsPort: MonitoringMetricsPort,
  ) {}

  /** Cette methode execute la lecture d observabilite consolidee. */
  public async executer(query: GetObservabilitySnapshotQuery): Promise<ObservabilitySnapshotDto> {
    return {
      etatSysteme: await this.healthService.calculerEtat(query.contexte),
      incidents: (await this.incidentPort.listerIncidents()).map((incident) => incident.details()),
      diagnostics: (await this.incidentPort.listerDiagnostics()).map((diagnostic) => diagnostic.valeur()),
      traces: (await this.tracingPort.listerTraces()).map((trace) => trace.valeur()),
      capacites: (await this.metricsPort.listerCapacites()).map((capacite) => capacite.valeur()),
      saturations: (await this.metricsPort.listerSaturations()).map((saturation) => saturation.valeur()),
    };
  }
}
