import { OfflineAuditChronologyService } from '../../../infrastructure/offline';
import { SynchronizationChronologyService } from '../../../infrastructure/synchronization';
import type { OfflineAuditQueueItem } from '../../../infrastructure/offline';

export class AuditSynchronizationChronologyBridge {
  public constructor(
    private readonly synchronizationChronology: SynchronizationChronologyService = new SynchronizationChronologyService(),
    private readonly offlineChronology: OfflineAuditChronologyService = new OfflineAuditChronologyService(),
  ) {}

  public avantSync(item: OfflineAuditQueueItem): void {
    this.synchronizationChronology.enregistrerAvantSync(item);
  }

  public apresSync(item: OfflineAuditQueueItem): void {
    this.synchronizationChronology.enregistrerApresSync(item);
  }

  public lister() {
    return this.offlineChronology.lister();
  }
}
