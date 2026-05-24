import { AuditTraceService } from 'shared/audit/infrastructure/monitoring';
import type { MonitoringRuntimeObservation } from '../MonitoringAuditIntegrationTypes';

export class AuditForensicMonitoringIntegration {
  public constructor(
    private readonly traces: AuditTraceService = new AuditTraceService(),
  ) {}

  public obtenirSnapshot(observations: readonly MonitoringRuntimeObservation[]) {
    return {
      traces: this.traces.lister(),
      observationsRecentes: observations.slice(-25),
    };
  }
}
