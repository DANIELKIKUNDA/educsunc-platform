import type { SharedBusEventEnvelope } from '../../../../infrastructure/bus';
import { AuditMetricsService, AuditTraceService } from '../../../infrastructure/monitoring';

// Ce pont alimente l observabilite Audit a partir des evenements distribues.
export class AuditEventMonitoringBridge {
  public constructor(
    private readonly metrics = new AuditMetricsService(),
    private readonly traces = new AuditTraceService(),
  ) {}

  public observer(_envelope: SharedBusEventEnvelope): { metrics: number; traces: number } {
    return {
      metrics: this.metrics.collecter().length,
      traces: this.traces.lister().length,
    };
  }

  public obtenirSnapshot() {
    return {
      metrics: this.metrics.collecter(),
      traces: this.traces.lister(),
    };
  }
}
