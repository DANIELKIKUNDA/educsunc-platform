import { AuditHealthCheckService } from '../health/AuditHealthCheckService';
import { AuditMetricsService } from '../metrics/AuditMetricsService';
import { AuditAlertService } from '../alerts/AuditAlertService';
import type { AuditDashboardSnapshot } from '../MonitoringTypes';

// Les dashboards servent la supervision runtime, pas l analytics métier.
export class AuditDashboardService {
  public constructor(
    private readonly health: AuditHealthCheckService = new AuditHealthCheckService(),
    private readonly metrics: AuditMetricsService = new AuditMetricsService(),
    private readonly alerts: AuditAlertService = new AuditAlertService(),
  ) {}

  public async construire(): Promise<AuditDashboardSnapshot> {
    return {
      health: await this.health.verifier(),
      metrics: await this.metrics.collecter(),
      alerts: this.alerts.detecter(),
    };
  }
}
