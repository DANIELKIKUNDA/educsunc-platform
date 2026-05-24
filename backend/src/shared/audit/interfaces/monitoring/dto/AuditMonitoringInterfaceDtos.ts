export interface AuditMonitoringHealthDto {
  readonly db: string;
  readonly queues: string;
  readonly workers: string;
  readonly syncEngine: string;
  readonly projections: string;
  readonly exports: string;
  readonly eventBus: string;
}

export interface AuditMonitoringMetricsDto {
  readonly replayCount: number;
  readonly retryCount: number;
  readonly exportDurationMs: number;
  readonly queueSize: number;
  readonly syncFailures: number;
  readonly workerThroughput: number;
  readonly projectionLag: number;
}

export interface AuditMonitoringTraceDto {
  readonly requestId?: string;
  readonly correlationId?: string;
  readonly sessionId?: string;
  readonly replayId?: string;
  readonly etapes: readonly string[];
}

export interface AuditMonitoringQueueDto {
  readonly backlog: number;
  readonly taille: number;
  readonly deadLetter: number;
  readonly throughput: number;
  readonly attenteMs: number;
  readonly saturation: boolean;
}

export interface AuditMonitoringWorkerDto {
  readonly actifs: number;
  readonly echoues: number;
  readonly retries: number;
  readonly crashes: number;
  readonly throughput: number;
  readonly tempsExecutionMs: number;
}

export interface AuditMonitoringReplayDto {
  readonly actifs: number;
  readonly failures: number;
  readonly volumetrie: number;
  readonly durationMs: number;
  readonly queues: number;
}

export interface AuditMonitoringRetryDto {
  readonly loops: number;
  readonly storms: number;
  readonly failures: number;
  readonly saturation: boolean;
}

export interface AuditMonitoringSynchronizationDto {
  readonly failures: number;
  readonly conflits: number;
  readonly replaySync: number;
  readonly retrySync: number;
  readonly appareilsOffline: number;
  readonly delaisSyncMs: number;
}

export interface AuditMonitoringExportsDto {
  readonly actifs: number;
  readonly volumetrie: number;
  readonly tempsGenerationMs: number;
  readonly expirations: number;
  readonly downloads: number;
  readonly failures: number;
}

export interface AuditMonitoringProjectionsDto {
  readonly lag: number;
  readonly rebuilds: number;
  readonly failures: number;
  readonly desynchronisations: number;
  readonly volumetrie: number;
}

export interface AuditMonitoringAnomaliesDto {
  readonly replayMassif: number;
  readonly retryStorm: number;
  readonly exportEnorme: number;
  readonly syncAnormale: number;
  readonly queueSaturation: number;
  readonly erreursRepetees: number;
}

export interface AuditMonitoringAlertsDto {
  readonly queuesBloquees: number;
  readonly workersMorts: number;
  readonly saturation: number;
  readonly replayFailure: number;
  readonly syncFailure: number;
  readonly exportFailure: number;
}

export interface AuditMonitoringTenantDto {
  readonly volumetrieTenant: number;
  readonly exportsTenant: number;
  readonly incidentsTenant: number;
  readonly replayTenant: number;
  readonly syncTenant: number;
}

export interface AuditMonitoringVolumetryDto {
  readonly partitions: number;
  readonly exports: number;
  readonly queues: number;
  readonly forensic: number;
  readonly archives: number;
  readonly projections: number;
}

export interface AuditMonitoringObservabilityDto {
  readonly metriques: number;
  readonly traces: number;
  readonly evenements: number;
  readonly timings: number;
  readonly correlations: number;
}

export interface AuditMonitoringRecoveryDto {
  readonly relanceMonitoring: boolean;
}

