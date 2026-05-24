import { OfflineAuditConflictService } from '../conflicts/OfflineAuditConflictService';
import { OfflineAuditDeviceRegistry } from '../devices/OfflineAuditDeviceRegistry';
import { PersistentOfflineAuditQueue } from '../queue/PersistentOfflineAuditQueue';
import type { OfflineAuditMonitoringSnapshot } from '../OfflineAuditTypes';

// Le monitoring offline suit queue, conflits, appareils, replay et retry.
export class OfflineAuditMonitoringService {
  public constructor(
    private readonly queue: PersistentOfflineAuditQueue = new PersistentOfflineAuditQueue(),
    private readonly devices: OfflineAuditDeviceRegistry = new OfflineAuditDeviceRegistry(),
    private readonly conflicts: OfflineAuditConflictService = new OfflineAuditConflictService(),
  ) {}

  public obtenirSnapshot(): OfflineAuditMonitoringSnapshot {
    const items = this.queue.lister();
    return {
      totalQueue: items.length,
      totalEnAttente: items.filter((item) => item.statut === 'EN_ATTENTE').length,
      totalSynchronises: items.filter((item) => item.statut === 'SYNCHRONISE').length,
      totalEnEchec: items.filter((item) => item.statut === 'ECHEC').length,
      totalConflits: this.conflicts.lister().length,
      totalDevices: this.devices.lister().length,
      totalReplays: items.filter((item) => Boolean(item.replayId)).length,
      totalRetries: items.reduce((sum, item) => sum + item.retryCount, 0),
    };
  }
}
