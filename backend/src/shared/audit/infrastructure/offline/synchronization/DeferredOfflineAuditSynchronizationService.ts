import { PostgresAuditOfflineRepository } from '../../persistence/postgres/repositories';
import { PersistentOfflineAuditQueue } from '../queue/PersistentOfflineAuditQueue';
import { OfflineAuditChronologyService } from '../chronology/OfflineAuditChronologyService';
import type { OfflineAuditQueueItem } from '../OfflineAuditTypes';

// La synchronisation offline lance un flux ordonne et preservant la vraie chronologie.
export class DeferredOfflineAuditSynchronizationService {
  public constructor(
    private readonly queue: PersistentOfflineAuditQueue = new PersistentOfflineAuditQueue(),
    private readonly chronology: OfflineAuditChronologyService = new OfflineAuditChronologyService(),
    private readonly repository: PostgresAuditOfflineRepository = new PostgresAuditOfflineRepository(),
  ) {}

  public listerLotsSynchronisables(): OfflineAuditQueueItem[] {
    return this.queue.listerEnAttente();
  }

  public async marquerSynchronise(itemId: string, idAudit?: string): Promise<void> {
    const current = this.queue.retrouver(itemId);
    if (!current) {
      return;
    }

    const synchronise: OfflineAuditQueueItem = {
      ...current,
      statut: 'SYNCHRONISE',
    };
    this.queue.mettreAJour(synchronise);
    this.chronology.enregistrerSynchronisation(synchronise, new Date());

    if (idAudit) {
      await this.repository.marquerSynchronise?.(idAudit, new Date());
    }
  }
}
