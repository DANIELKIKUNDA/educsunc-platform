import type { SharedBusEventEnvelope } from '../../../../infrastructure/bus';
import { AuditMetricsService, AuditTraceService } from '../../../infrastructure/monitoring';

// Ce pont alimente l observabilite Audit a partir des evenements distribues.
export class AuditEventMonitoringBridge {
  public constructor(
    private readonly metrics = new AuditMetricsService(),
    private readonly traces = new AuditTraceService(),
  ) {}

  public async observer(_envelope: SharedBusEventEnvelope): Promise<{ metrics: number; traces: number }> {
    return {
      metrics: (await this.metrics.collecter()).length,
      traces: this.traces.lister().length,
    };
  }

  public async obtenirSnapshot() {
    return {
      metrics: await this.metrics.collecter(),
      traces: this.traces.lister(),
    };
  }
}
