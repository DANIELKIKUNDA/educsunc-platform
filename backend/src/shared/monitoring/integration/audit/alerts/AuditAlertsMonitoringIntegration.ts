import { AuditAlertService } from 'shared/audit/infrastructure/monitoring';

export class AuditAlertsMonitoringIntegration {
  public constructor(
    private readonly alerts: AuditAlertService = new AuditAlertService(),
  ) {}

  public detecter() {
    return this.alerts.detecter();
  }
}
