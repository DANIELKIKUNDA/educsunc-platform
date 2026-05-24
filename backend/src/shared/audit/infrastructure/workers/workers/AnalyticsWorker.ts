import { AuditMetricsService } from '../../monitoring';

export class AnalyticsWorker {
  private readonly metrics = new AuditMetricsService();

  public async executer(): Promise<void> {
    void this.metrics.collecter();
  }
}
