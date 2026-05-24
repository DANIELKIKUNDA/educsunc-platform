import { OfflineAuditMonitoringService } from '../../offline';
import { AuditIdempotencyMonitoringService } from '../../idempotency';

export class AuditReplayRuntimeMonitoring {
  public constructor(
    private readonly offline: OfflineAuditMonitoringService = new OfflineAuditMonitoringService(),
    private readonly idempotency: AuditIdempotencyMonitoringService = new AuditIdempotencyMonitoringService(),
  ) {}

  public obtenirSnapshot() {
    const offline = this.offline.obtenirSnapshot();
    const idempotency = this.idempotency.obtenirSnapshot();
    return {
      totalReplays: offline.totalReplays + idempotency.totalReplays,
      totalRetriesAssocies: offline.totalRetries + idempotency.totalRetries,
    };
  }
}
