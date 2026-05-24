import { OfflineAuditMonitoringService } from '../../offline';
import type { AuditSynchronizationMonitoringSnapshot } from '../SynchronizationTypes';

const syncStats = {
  totalSynchronisations: 0,
  totalBatches: 0,
  dernierSyncAt: undefined as string | undefined,
};

// Le monitoring sync consolide queue, conflits, retries, replays et appareils.
export class SynchronizationMonitoringService {
  public constructor(
    private readonly offlineMonitoring: OfflineAuditMonitoringService = new OfflineAuditMonitoringService(),
  ) {}

  public marquerBatchTraite(): void {
    syncStats.totalBatches += 1;
  }

  public marquerSynchronisation(): void {
    syncStats.totalSynchronisations += 1;
    syncStats.dernierSyncAt = new Date().toISOString();
  }

  public obtenirSnapshot(): AuditSynchronizationMonitoringSnapshot {
    const offline = this.offlineMonitoring.obtenirSnapshot();
    return {
      totalSynchronisations: syncStats.totalSynchronisations,
      totalBatches: syncStats.totalBatches,
      totalConflits: offline.totalConflits,
      totalRetries: offline.totalRetries,
      totalReplays: offline.totalReplays,
      totalDevices: offline.totalDevices,
      dernierSyncAt: syncStats.dernierSyncAt,
    };
  }
}
