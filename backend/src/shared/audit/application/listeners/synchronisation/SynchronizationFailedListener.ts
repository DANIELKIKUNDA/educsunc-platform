import { CreateOfflineAuditHandler } from '../../handlers/offline/CreateOfflineAuditHandler';
import type { CreateOfflineAuditEntryInput } from '../../dto/inputs/CreateOfflineAuditEntryInput';

// Ce listener traduit un evenement transverse en intention applicative Audit.
export class SynchronizationFailedListener {
  constructor(private readonly handler: CreateOfflineAuditHandler) {}

  public async ecouter(evenement: CreateOfflineAuditEntryInput): Promise<void> {
    await this.handler.executer(evenement);
  }
}
