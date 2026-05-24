import { AuditAnomalyDetectionService } from 'shared/audit/infrastructure/monitoring';

export class AuditAnomaliesMonitoringIntegration {
  public constructor(
    private readonly anomalies: AuditAnomalyDetectionService = new AuditAnomalyDetectionService(),
  ) {}

  public detecter() {
    return this.anomalies.detecter();
  }
}
