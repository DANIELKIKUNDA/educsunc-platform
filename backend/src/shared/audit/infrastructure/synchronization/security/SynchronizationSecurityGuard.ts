import type { OfflineAuditQueueItem } from '../../offline';

// La sync reste tenant-aware et prepare les futures validations de signature et controle appareil.
export class SynchronizationSecurityGuard {
  public valider(item: OfflineAuditQueueItem): boolean {
    return Boolean(item.organisationId || item.ecoleId || item.scope);
  }
}
