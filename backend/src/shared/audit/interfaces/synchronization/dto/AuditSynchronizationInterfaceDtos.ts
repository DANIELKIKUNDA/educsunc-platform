export interface AuditSynchronizationChronologyDto {
  readonly dateAction?: string;
  readonly dateCreationLocale?: string;
  readonly dateSync?: string;
  readonly replayTimestamp?: string;
  readonly retryTimestamp?: string;
  readonly insertionTimestamp?: string;
}

export interface AuditSynchronizationReplayDto {
  readonly replaySource?: string;
  readonly replayReason?: string;
  readonly correlationId?: string;
  readonly chronology: AuditSynchronizationChronologyDto;
}

export interface AuditSynchronizationRetryDto {
  readonly retryCount: number;
  readonly retryHistory: readonly string[];
  readonly retryReason?: string;
  readonly retryWindow?: string;
}

export interface AuditSynchronizationConflictDto {
  readonly auditId?: string;
  readonly typeConflit:
    | 'CHRONOLOGIQUE'
    | 'MODIFICATION'
    | 'REPLAY'
    | 'RETRY'
    | 'PROJECTION'
    | 'APPAREIL';
  readonly resolution?: string;
  readonly justification?: string;
}

export interface AuditSynchronizationDeviceDto {
  readonly deviceId?: string;
  readonly appVersion?: string;
  readonly syncVersion?: string;
  readonly lastSync?: string;
  readonly offlineDuration?: number;
  readonly retryHistory: readonly string[];
}

export interface AuditSynchronizationRecoveryDto {
  readonly recoveryId: string;
  readonly idempotent: boolean;
  readonly securise: boolean;
  readonly tracable: boolean;
}

export interface AuditSynchronizationQueueDto {
  readonly backlog: number;
  readonly saturation: boolean;
  readonly retries: number;
  readonly deadLetter: number;
  readonly throughput: number;
}

export interface AuditSynchronizationWorkerDto {
  readonly syncWorkers: number;
  readonly replayWorkers: number;
  readonly retryWorkers: number;
  readonly mergeWorkers: number;
  readonly projectionWorkers: number;
}

export interface AuditSynchronizationOrchestrationDto {
  readonly queues: number;
  readonly workers: number;
  readonly projections: number;
  readonly monitoring: number;
  readonly forensic: number;
}

export interface AuditSynchronizationMonitoringDto {
  readonly syncFailures: number;
  readonly retryStorms: number;
  readonly replaySync: number;
  readonly saturation: number;
  readonly appareilsOffline: number;
  readonly conflits: number;
}

export interface AuditSynchronizationForensicDto {
  readonly chronologyReelle: boolean;
  readonly replayMetadata: boolean;
  readonly retryMetadata: boolean;
  readonly conflits: boolean;
  readonly appareils: boolean;
  readonly reconnexions: boolean;
}

export interface AuditSynchronizationAnalyticsDto {
  readonly batchs: number;
  readonly incrementaux: number;
  readonly checkpoints: number;
}

export interface AuditSynchronizationBatchingDto {
  readonly batchSync: boolean;
  readonly incrementalSync: boolean;
  readonly chunkSync: boolean;
  readonly streamingSync: boolean;
}

export interface AuditSynchronizationIncrementalDto {
  readonly chronology: boolean;
  readonly replay: boolean;
  readonly retry: boolean;
  readonly consistency: boolean;
}

export interface AuditSynchronizationCheckpointDto {
  readonly dernierEvenement?: string;
  readonly derniereProjection?: string;
  readonly dernierReplay?: string;
  readonly derniereQueue?: string;
  readonly derniereSynchronisationValide?: string;
}

export interface AuditSynchronizationStatusDto {
  readonly total: number;
  readonly synchronises: number;
  readonly enConflit: number;
  readonly enAttente: number;
  readonly auditId?: string;
  readonly statutSynchronisation?: string;
  readonly replay?: boolean;
  readonly retry?: boolean;
  readonly conflit?: boolean;
  readonly horodatage?: string;
}

