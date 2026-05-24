import { obtenirMemoireAuditStore } from '../../persistence/postgres/repositories/_memoireAuditStore';

export class AuditProjectionMonitoringService {
  public obtenirSnapshot() {
    const store = obtenirMemoireAuditStore();
    return {
      totalProjections: store.auditProjections.size,
      totalAnalyticsSnapshots: store.auditAnalyticsSnapshots.size,
    };
  }
}
