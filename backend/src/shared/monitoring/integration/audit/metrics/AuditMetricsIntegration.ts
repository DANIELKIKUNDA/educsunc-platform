import { AuditMetricsService } from 'shared/audit/infrastructure/monitoring';

export class AuditMetricsIntegration {
  public constructor(
    private readonly metrics: AuditMetricsService = new AuditMetricsService(),
  ) {}

  public collecter() {
    return this.metrics.collecter();
  }
}
