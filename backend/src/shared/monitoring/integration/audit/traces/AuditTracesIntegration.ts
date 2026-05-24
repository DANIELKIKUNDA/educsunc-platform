import { AuditTraceService } from 'shared/audit/infrastructure/monitoring';

export class AuditTracesIntegration {
  public constructor(
    private readonly traces: AuditTraceService = new AuditTraceService(),
  ) {}

  public lister() {
    return this.traces.lister();
  }
}
