import {
  IncrementalSynchronizationCursorStore,
  SynchronizationRecoveryService,
} from '../../../infrastructure/synchronization';

export class AuditSynchronizationRecoveryBridge {
  public constructor(
    private readonly recovery: SynchronizationRecoveryService = new SynchronizationRecoveryService(),
    private readonly cursors: IncrementalSynchronizationCursorStore = new IncrementalSynchronizationCursorStore(),
  ) {}

  public checkpoint(args: {
    organisationId?: string;
    ecoleId?: string;
    scope?: string;
    deviceId?: string;
    lastSyncedEventId?: string;
  }): void {
    this.recovery.checkpoint(args.lastSyncedEventId);
    this.cursors.ecrire({
      organisationId: args.organisationId,
      ecoleId: args.ecoleId,
      scope: args.scope,
      deviceId: args.deviceId,
      lastSyncedEventId: args.lastSyncedEventId,
      lastSyncedAt: new Date().toISOString(),
    });
  }

  public reprendre(): string[] {
    return this.recovery.reprendreDepuisDernierCheckpoint();
  }
}
