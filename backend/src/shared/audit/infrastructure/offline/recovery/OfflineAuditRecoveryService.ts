import { PersistentOfflineAuditQueue } from '../queue/PersistentOfflineAuditQueue';
import { obtenirOfflineAuditLocalStore } from '../storage/OfflineAuditLocalStore';
import type { OfflineAuditRecoveryCheckpoint } from '../OfflineAuditTypes';

// La reprise offline doit restaurer la queue et permettre une resynchronisation differée.
export class OfflineAuditRecoveryService {
  public constructor(
    private readonly queue: PersistentOfflineAuditQueue = new PersistentOfflineAuditQueue(),
  ) {}

  public creerCheckpoint(dernierCurseurSync?: string): OfflineAuditRecoveryCheckpoint {
    const checkpoint: OfflineAuditRecoveryCheckpoint = {
      idCheckpoint: `offline-checkpoint-${Date.now()}`,
      dernierCurseurSync,
      itemsEnAttente: this.queue.listerEnAttente().map((item) => item.id),
      creeLe: new Date().toISOString(),
    };
    obtenirOfflineAuditLocalStore().checkpoints.set(checkpoint.idCheckpoint, checkpoint);
    return checkpoint;
  }

  public retrouverDernierCheckpoint(): OfflineAuditRecoveryCheckpoint | null {
    const checkpoints = [...obtenirOfflineAuditLocalStore().checkpoints.values()];
    return checkpoints.at(-1) ?? null;
  }
}
