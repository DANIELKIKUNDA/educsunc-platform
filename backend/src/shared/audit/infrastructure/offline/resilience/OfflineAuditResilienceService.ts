import { OfflineAuditRecoveryService } from '../recovery/OfflineAuditRecoveryService';

export interface OfflineAuditResilienceSnapshot {
  readonly supporteReconnexion: boolean;
  readonly supporteSyncPartielle: boolean;
  readonly checkpointActif: boolean;
}

// Le mode offline est normal et doit survivre aux coupures et reprises reseau.
export class OfflineAuditResilienceService {
  public constructor(
    private readonly recovery: OfflineAuditRecoveryService = new OfflineAuditRecoveryService(),
  ) {}

  public evaluer(): OfflineAuditResilienceSnapshot {
    return {
      supporteReconnexion: true,
      supporteSyncPartielle: true,
      checkpointActif: this.recovery.retrouverDernierCheckpoint() !== null,
    };
  }
}
