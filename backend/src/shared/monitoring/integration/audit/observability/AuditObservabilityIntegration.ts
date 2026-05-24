import { AuditObservabilityService } from 'shared/audit/infrastructure/monitoring';
import type { MonitoringRuntimeObservation } from '../MonitoringAuditIntegrationTypes';

const runtimeObservations: MonitoringRuntimeObservation[] = [];

export class AuditObservabilityIntegration {
  public constructor(
    private readonly observability: AuditObservabilityService = new AuditObservabilityService(),
  ) {}

  public enregistrerObservation(observation: MonitoringRuntimeObservation): void {
    runtimeObservations.push({ ...observation });
    if (runtimeObservations.length > 500) {
      runtimeObservations.splice(0, runtimeObservations.length - 500);
    }
  }

  public listerObservations(): readonly MonitoringRuntimeObservation[] {
    return [...runtimeObservations];
  }

  public capturer() {
    return this.observability.capturer();
  }
}
