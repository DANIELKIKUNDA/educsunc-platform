import type { MonitoringRuntimeObservation } from '../MonitoringAuditIntegrationTypes';
import type { AuditAlertRecord } from 'shared/audit/infrastructure/monitoring';

export class AuditIncidentsMonitoringIntegration {
  public construireDepuisAlertes(
    alerts: readonly AuditAlertRecord[],
    observations: readonly MonitoringRuntimeObservation[],
  ) {
    const recent = observations.at(-1);
    return alerts.map((alert) => ({
      code: alert.code,
      severite: alert.severite,
      message: alert.message,
      source: 'ALERTE' as const,
      forensic: {
        correlationId: recent?.correlationId,
        requestId: recent?.requestId,
        traceId: recent?.traceId,
        spanId: recent?.spanId,
        organisationId: recent?.organisationId,
        ecoleId: recent?.ecoleId,
      },
    }));
  }
}
