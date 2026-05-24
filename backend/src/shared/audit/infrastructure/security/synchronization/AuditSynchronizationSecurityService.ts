import { SynchronizationSecurityGuard } from '../../synchronization';
import type { OfflineAuditQueueItem } from '../../offline';
import type { AuditAccessDecision } from '../SecurityTypes';

export class AuditSynchronizationSecurityService {
  public constructor(
    private readonly guard: SynchronizationSecurityGuard = new SynchronizationSecurityGuard(),
  ) {}

  public verifier(item: OfflineAuditQueueItem): AuditAccessDecision {
    return this.guard.valider(item)
      ? { autorise: true, raison: 'Payload de synchronisation valide.' }
      : { autorise: false, raison: 'Payload de synchronisation invalide ou non tenant-aware.' };
  }
}
