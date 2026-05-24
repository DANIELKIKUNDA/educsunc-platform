import { AuditHealthCheckService } from '../health/AuditHealthCheckService';
import { AuditMetricsService } from '../metrics/AuditMetricsService';
import { AuditTraceService } from '../traces/AuditTraceService';
import { AuditAlertService } from '../alerts/AuditAlertService';
import type { AuditObservabilitySnapshot } from '../MonitoringTypes';

// L observabilité combine santé, métriques, traces et alertes sans bloquer le runtime.
export class AuditObservabilityService {
  public constructor(
    private readonly health: AuditHealthCheckService = new AuditHealthCheckService(),
    private readonly metrics: AuditMetricsService = new AuditMetricsService(),
    private readonly traces: AuditTraceService = new AuditTraceService(),
    private readonly alerts: AuditAlertService = new AuditAlertService(),
  ) {}

  public capturer(): AuditObservabilitySnapshot {
    return {
      health: this.health.verifier(),
      metrics: this.metrics.collecter(),
      traces: this.traces.lister(),
      alerts: this.alerts.detecter(),
    };
  }
}
