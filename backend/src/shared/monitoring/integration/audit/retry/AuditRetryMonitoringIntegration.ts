import { AuditRetryRuntimeMonitoring } from 'shared/audit/infrastructure/monitoring';

export class AuditRetryMonitoringIntegration {
  public constructor(
    private readonly retry: AuditRetryRuntimeMonitoring = new AuditRetryRuntimeMonitoring(),
  ) {}

  public obtenirSnapshot() {
    return this.retry.obtenirSnapshot();
  }
}
