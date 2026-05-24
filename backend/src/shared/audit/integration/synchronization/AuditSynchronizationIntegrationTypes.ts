import type { AuditContext } from '../../context';
import type {
  AuditSynchronizationBatch,
  AuditSynchronizationConflict,
  AuditSynchronizationMergeStrategy,
  AuditSynchronizationResult,
} from '../../infrastructure/synchronization';
import type { OfflineAuditQueueItem } from '../../infrastructure/offline';

export interface AuditSynchronizationMetadata {
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly scope?: string;
  readonly deviceId?: string;
  readonly syncId?: string;
  readonly replayId?: string;
  readonly retryCount: number;
  readonly chronology: {
    readonly dateActionReelle?: string;
    readonly dateInsertionLocale?: string;
    readonly dateSynchronisation?: string;
  };
}

export interface AuditSynchronizationCheckpoint {
  readonly checkpointId: string;
  readonly auditContext?: AuditContext;
  readonly lastSyncedEventId?: string;
  readonly lastMergeId?: string;
  readonly createdAt: string;
}

export interface AuditSynchronizationLifecycleEvent {
  readonly name:
    | 'SyncReconnected'
    | 'SyncBatchStarted'
    | 'SyncBatchCompleted'
    | 'SyncConflictDetected'
    | 'SyncMergeCompleted'
    | 'SyncRecoveryTriggered';
  readonly auditContext?: AuditContext;
  readonly item?: OfflineAuditQueueItem;
  readonly batch?: AuditSynchronizationBatch;
  readonly conflict?: AuditSynchronizationConflict;
  readonly mergeStrategy?: AuditSynchronizationMergeStrategy;
  readonly result?: AuditSynchronizationResult;
  readonly checkpoint?: AuditSynchronizationCheckpoint;
}
