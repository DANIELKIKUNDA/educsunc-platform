import { RetryOfflineAuditHandler } from '../../handlers/offline/RetryOfflineAuditHandler';
import type { OfflineAuditRetryInput } from '../../dto/offline/OfflineAuditRetryInput';

// Ce listener traduit un evenement transverse en intention applicative Audit.
export class RetryDetectedListener {
  constructor(private readonly handler: RetryOfflineAuditHandler) {}

  public async ecouter(evenement: OfflineAuditRetryInput): Promise<void> {
    await this.handler.executer(evenement);
  }
}
