import { OfflineAuditChronologyService } from '../../offline';
import type { OfflineAuditQueueItem } from '../../offline';

// La chronologie sync preserve toujours action reelle, sync, replay et retry.
export class SynchronizationChronologyService {
  public constructor(
    private readonly chronology: OfflineAuditChronologyService = new OfflineAuditChronologyService(),
  ) {}

  public enregistrerAvantSync(item: OfflineAuditQueueItem): void {
    this.chronology.enregistrerQueue(item);
  }

  public enregistrerApresSync(item: OfflineAuditQueueItem): void {
    this.chronology.enregistrerSynchronisation(item, new Date());
  }
}
