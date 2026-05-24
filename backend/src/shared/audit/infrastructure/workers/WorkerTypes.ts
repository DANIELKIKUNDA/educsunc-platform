export type AuditWorkerQueueName =
  | 'PROJECTIONS'
  | 'EXPORTS'
  | 'SYNCHRONIZATION'
  | 'ANALYTICS'
  | 'RETENTION'
  | 'MONITORING'
  | 'FORENSIC';

export type AuditWorkerJobType =
  | 'ProjectionJob'
  | 'GenerateExportJob'
  | 'SyncBatchJob'
  | 'AnalyticsBatchJob'
  | 'RetentionCleanupJob'
  | 'MonitoringRefreshJob'
  | 'ReplayProjectionJob'
  | 'ArchivePartitionJob';

export interface AuditWorkerJobMetadata {
  readonly jobId: string;
  readonly queueName?: AuditWorkerQueueName;
  readonly workerName?: string;
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly sessionId?: string;
  readonly utilisateurId?: string;
  readonly source?: string;
  readonly replayId?: string;
  readonly replayReason?: string;
  readonly replaySource?: string;
  readonly originalEventId?: string;
  readonly originalActionDate?: string;
  readonly replayDate?: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly scope?: string;
  readonly createdAt: string;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly failedAt?: string;
  readonly retryCount: number;
  readonly retryReason?: string;
  readonly retryLimit: number;
  readonly retryBackoffMs: number;
  readonly nextRetryAt?: string;
  readonly lastError?: string;
  readonly retryHistory: string[];
}

export interface AuditWorkerJob<TPayload = Record<string, unknown>> {
  readonly type: AuditWorkerJobType;
  readonly queue: AuditWorkerQueueName;
  readonly payload: TPayload;
  readonly metadata: AuditWorkerJobMetadata;
}

export interface AuditWorkerExecutionResult {
  readonly jobId: string;
  readonly statut: 'SUCCES' | 'ECHEC' | 'REESSAYER' | 'DEAD_LETTER';
  readonly message: string;
}
