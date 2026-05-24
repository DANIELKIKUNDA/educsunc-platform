import { PersistentOfflineAuditQueue } from '../../offline';
import { obtenirAuditEventMemoryStore } from '../../event-bus';

export class AuditQueueMonitoringService {
  public constructor(
    private readonly queue: PersistentOfflineAuditQueue = new PersistentOfflineAuditQueue(),
  ) {}

  public obtenirSnapshot() {
    const offlineItems = this.queue.lister();
    const bus = obtenirAuditEventMemoryStore();
    return {
      tailleQueueOffline: offlineItems.length,
      backlogOffline: offlineItems.filter((item) => item.statut === 'EN_ATTENTE').length,
      deadLetter: bus.deadLetters.length,
      throughputEvenements: bus.events.length,
    };
  }
}
