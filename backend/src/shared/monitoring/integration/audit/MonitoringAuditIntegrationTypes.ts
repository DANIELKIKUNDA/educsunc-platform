import type { MonitoringContext } from '../../context';
import type {
  AuditAlertRecord,
  AuditMetricPoint,
  AuditObservabilitySnapshot,
  AuditTraceRecord,
} from 'shared/audit/infrastructure/monitoring';
import type { AuditExportMonitoringSnapshot } from 'shared/audit/infrastructure/exports';
import type { AuditSynchronizationMonitoringSnapshot } from 'shared/audit/infrastructure/synchronization';

export interface MonitoringRuntimeObservation extends MonitoringContext {}

export interface MonitoringAuditIncident {
  readonly code: string;
  readonly severite: 'INFO' | 'AVERTISSEMENT' | 'CRITIQUE';
  readonly message: string;
  readonly source: 'ALERTE' | 'ANOMALIE' | 'SANTE_RUNTIME';
  readonly forensic: Pick<
    MonitoringRuntimeObservation,
    'correlationId' | 'requestId' | 'traceId' | 'spanId' | 'organisationId' | 'ecoleId'
  >;
}

export interface MonitoringAuditSnapshot {
  readonly metrics: AuditMetricPoint[];
  readonly traces: AuditTraceRecord[];
  readonly alerts: AuditAlertRecord[];
  readonly incidents: readonly MonitoringAuditIncident[];
  readonly observations: readonly MonitoringRuntimeObservation[];
  readonly observability: AuditObservabilitySnapshot;
  readonly queues: Record<string, unknown>;
  readonly workers: Record<string, unknown>;
  readonly replay: Record<string, unknown>;
  readonly retry: Record<string, unknown>;
  readonly synchronization: AuditSynchronizationMonitoringSnapshot;
  readonly projections: Record<string, unknown>;
  readonly exports: AuditExportMonitoringSnapshot;
  readonly anomalies: readonly Record<string, unknown>[];
  readonly analytics: Record<string, unknown>;
  readonly forensic: Record<string, unknown>;
}
