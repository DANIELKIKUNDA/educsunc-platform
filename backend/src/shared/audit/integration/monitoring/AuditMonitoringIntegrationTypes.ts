import type { MonitoringAuditSnapshot, MonitoringRuntimeObservation } from 'shared/monitoring';

export interface AuditMonitoringIntegrationSnapshot {
  readonly monitoring: MonitoringAuditSnapshot;
  readonly eventBus: Record<string, unknown>;
}

export interface AuditMonitoringObservationInput extends MonitoringRuntimeObservation {}
