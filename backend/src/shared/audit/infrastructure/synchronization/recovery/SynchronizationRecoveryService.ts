import { OfflineAuditRecoveryService } from '../../offline';

// Une synchronisation interrompue doit etre reprenable sans casser la coherence.
export class SynchronizationRecoveryService {
  public constructor(
    private readonly recovery: OfflineAuditRecoveryService = new OfflineAuditRecoveryService(),
  ) {}

  public checkpoint(dernierCurseurSync?: string): void {
    this.recovery.creerCheckpoint(dernierCurseurSync);
  }

  public reprendreDepuisDernierCheckpoint(): string[] {
    return this.recovery.retrouverDernierCheckpoint()?.itemsEnAttente ?? [];
  }
}
