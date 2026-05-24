export interface AuditWorkerQueueDto {
  readonly nom: string;
  readonly chronology: boolean;
  readonly correlationId?: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly retryMetadata: boolean;
  readonly replayMetadata: boolean;
}

export interface AuditWorkerRuntimeDto {
  readonly type: 'REPLAY' | 'RETRY' | 'SYNC' | 'EXPORT' | 'ANALYTICS' | 'PROJECTION' | 'RETENTION' | 'FORENSIC' | 'MONITORING';
  readonly idempotent: boolean;
  readonly retryable: boolean;
  readonly monitorable: boolean;
}

export interface AuditSchedulerDto {
  readonly retention: boolean;
  readonly purge: boolean;
  readonly archival: boolean;
  readonly analyticsRebuild: boolean;
  readonly projectionsRebuild: boolean;
  readonly monitoringCleanup: boolean;
}

export interface AuditWorkerReplayDto {
  readonly chronology: boolean;
  readonly replayMetadata: boolean;
  readonly correlation: boolean;
  readonly tenantIsolation: boolean;
}

export interface AuditWorkerRetryDto {
  readonly retryLimit: number;
  readonly retryWindow?: string;
  readonly retryReason?: string;
  readonly retryBackoff?: string;
}

export interface AuditWorkerSynchronizationDto {
  readonly chronologyReelle: boolean;
  readonly retryMetadata: boolean;
  readonly replayMetadata: boolean;
  readonly deviceMetadata: boolean;
}

export interface AuditWorkerExportDto {
  readonly pdf: boolean;
  readonly csv: boolean;
  readonly json: boolean;
  readonly forensicBundles: boolean;
  readonly analyticsExports: boolean;
  readonly expiration: boolean;
}

export interface AuditWorkerRetentionDto {
  readonly archival: boolean;
  readonly coldStorage: boolean;
  readonly purge: boolean;
  readonly cleanup: boolean;
  readonly retentionRebuild: boolean;
}

export interface AuditWorkerAnalyticsDto {
  readonly tendances: boolean;
  readonly volumetrie: boolean;
  readonly anomalies: boolean;
  readonly statistiques: boolean;
  readonly aggregations: boolean;
}

export interface AuditWorkerProjectionDto {
  readonly timelines: boolean;
  readonly analytics: boolean;
  readonly monitoring: boolean;
  readonly forensic: boolean;
  readonly exportProjections: boolean;
}

export interface AuditWorkerDeadLetterDto {
  readonly payload: boolean;
  readonly erreur: boolean;
  readonly chronology: boolean;
  readonly tenant: boolean;
  readonly forensicMetadata: boolean;
}

export interface AuditWorkerCheckpointDto {
  readonly replayCheckpoint?: string;
  readonly syncCheckpoint?: string;
  readonly projectionCheckpoint?: string;
  readonly exportCheckpoint?: string;
}

export interface AuditWorkerOrchestrationDto {
  readonly ordreLogique: boolean;
  readonly chronology: boolean;
  readonly idempotence: boolean;
  readonly coherenceRuntime: boolean;
}

export interface AuditWorkerForensicDto {
  readonly replayMetadata: boolean;
  readonly retryMetadata: boolean;
  readonly queueMetadata: boolean;
  readonly workerMetadata: boolean;
  readonly timing: boolean;
  readonly chronology: boolean;
}

export interface AuditWorkerMonitoringDto {
  readonly throughput: number;
  readonly failures: number;
  readonly retries: number;
  readonly saturation: number;
  readonly queueLag: number;
  readonly timingsMs: number;
}

export interface AuditWorkerRecoveryDto {
  readonly crashWorker: boolean;
  readonly redemarrage: boolean;
  readonly reconnexion: boolean;
  readonly retryMassif: boolean;
  readonly replayMassif: boolean;
}

export interface AuditWorkerSecurityDto {
  readonly authInterne: boolean;
  readonly validation: boolean;
  readonly tenantIsolation: boolean;
  readonly replayProtection: boolean;
  readonly retryProtection: boolean;
}

export interface AuditWorkerObservabilityDto {
  readonly requestId?: string;
  readonly correlationId?: string;
  readonly traces: boolean;
  readonly metriques: boolean;
  readonly timings: boolean;
  readonly workerMetadata: boolean;
}

