import type { OfflineAuditQueueItem } from '../offline';

export interface AuditSynchronizationCursor {
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly scope?: string;
  readonly deviceId?: string;
  readonly lastSyncedEventId?: string;
  readonly lastSyncedAt?: string;
}

export interface AuditSynchronizationBatch {
  readonly idBatch: string;
  readonly items: OfflineAuditQueueItem[];
  readonly taille: number;
  readonly creeLe: string;
}

export interface AuditSynchronizationConflict {
  readonly idConflit: string;
  readonly idQueueItem: string;
  readonly typeConflit: string;
  readonly description?: string;
  readonly strategieMerge?: AuditSynchronizationMergeStrategy;
}

export type AuditSynchronizationMergeStrategy =
  | 'APPEND_ONLY'
  | 'MERGE_AUTOMATIQUE'
  | 'MERGE_MANUEL'
  | 'MERGE_METIER'
  | 'CONFLIT';

export interface AuditSynchronizationResult {
  readonly totalTraites: number;
  readonly totalSynchronises: number;
  readonly totalEnConflit: number;
  readonly totalEnEchec: number;
  readonly syncId: string;
  readonly batchId?: string;
}

export interface AuditSynchronizationMonitoringSnapshot {
  readonly totalSynchronisations: number;
  readonly totalBatches: number;
  readonly totalConflits: number;
  readonly totalRetries: number;
  readonly totalReplays: number;
  readonly totalDevices: number;
  readonly dernierSyncAt?: string;
}
