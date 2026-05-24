import { ReplayOfflineAuditHandler } from '../../handlers/offline/ReplayOfflineAuditHandler';
import type { OfflineAuditReplayInput } from '../../dto/offline/OfflineAuditReplayInput';

// Ce listener traduit un evenement transverse en intention applicative Audit.
export class ReplayDetectedListener {
  constructor(private readonly handler: ReplayOfflineAuditHandler) {}

  public async ecouter(evenement: OfflineAuditReplayInput): Promise<void> {
    await this.handler.executer(evenement);
  }
}
