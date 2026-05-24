import { obtenirMemoireAuditStore } from '../../persistence/postgres/repositories/_memoireAuditStore';
import type { AuditRetentionSnapshot } from '../RetentionTypes';

export class AuditRetentionMonitoringService {
  public obtenirSnapshot(): AuditRetentionSnapshot {
    const store = obtenirMemoireAuditStore();
    return {
      totalActifs: store.auditEntries.size,
      totalArchives: store.auditArchives.size,
      totalColdStorage: store.auditColdStoragePackages.size,
      totalExportsExpires: [...store.auditExports.values()].filter((entry) => entry.dateExpiration instanceof Date && entry.dateExpiration.getTime() <= Date.now()).length,
      totalEligiblesPurge: 0,
    };
  }
}
