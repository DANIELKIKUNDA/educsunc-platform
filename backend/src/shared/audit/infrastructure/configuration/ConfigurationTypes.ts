export type AuditConfigurationScopeLevel = 'GLOBAL' | 'ENVIRONNEMENT' | 'ORGANISATION' | 'ECOLE';

export interface AuditConfigurationScope {
  readonly niveau: AuditConfigurationScopeLevel;
  readonly environnement?: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
}

export interface AuditRuntimeConfiguration {
  readonly batchSize: number;
  readonly retryLimit: number;
  readonly replayLimit: number;
  readonly retentionDays: number;
  readonly queueSize: number;
  readonly exportExpirationHours: number;
  readonly monitoringThresholds: Record<string, number>;
}

export interface AuditRetentionConfiguration {
  readonly dureeLogsJours: number;
  readonly dureeForensicJours: number;
  readonly expirationExportsJours: number;
  readonly archivageApresJours: number;
  readonly coldStorageApresJours: number;
  readonly purgeDiffereeJours: number;
}

export interface AuditReplayConfiguration {
  readonly replayBatch: number;
  readonly replayWindowHours: number;
  readonly replayDepth: number;
  readonly replayThrottlePerMinute: number;
}

export interface AuditRetryConfiguration {
  readonly retryLimit: number;
  readonly retryBackoffMs: number;
  readonly retryThrottlePerMinute: number;
  readonly deadLetterAfter: number;
}

export interface AuditExportsConfiguration {
  readonly expirationHours: number;
  readonly tailleMaxMb: number;
  readonly formatsAutorises: readonly string[];
  readonly compressionActivee: boolean;
  readonly streamingActive: boolean;
  readonly telechargementSecurise: boolean;
}

export interface AuditSynchronizationConfiguration {
  readonly batchSize: number;
  readonly retryLimit: number;
  readonly replayLimit: number;
  readonly conflictPolicy: 'SERVER_WINS' | 'CLIENT_WINS' | 'MANUAL';
  readonly syncIntervalSeconds: number;
  readonly queueStrategy: 'FIFO' | 'PRIORITY' | 'ADAPTIVE';
}

export interface AuditMonitoringConfiguration {
  readonly thresholds: Record<string, number>;
  readonly alertLimit: number;
  readonly retentionMonitoringJours: number;
  readonly volumetrieMax: number;
  readonly healthRules: readonly string[];
  readonly anomalyThresholds: Record<string, number>;
}

export interface AuditSecurityConfiguration {
  readonly permissionsRenforcees: boolean;
  readonly isolationTenantMode: 'STRICTE' | 'STANDARD';
  readonly accesForensic: 'INTERDIT' | 'RESTREINT' | 'ETENDU';
  readonly accesExports: 'INTERDIT' | 'RESTREINT' | 'ETENDU';
  readonly accesArchives: 'INTERDIT' | 'RESTREINT' | 'ETENDU';
  readonly protectionReplayActivee: boolean;
}

export interface AuditWorkersConfiguration {
  readonly concurrency: number;
  readonly retryLimit: number;
  readonly deadLetterLimit: number;
  readonly throughputParMinute: number;
  readonly schedulingActif: boolean;
}

export interface AuditQueuesConfiguration {
  readonly limiteGlobale: number;
  readonly limiteParQueue: number;
  readonly strategiePriorite: 'FIFO' | 'PRIORITY' | 'WEIGHTED';
}

export interface AuditForensicConfiguration {
  readonly profondeurHistoriqueJours: number;
  readonly niveauCorrelation: 'STANDARD' | 'AVANCE' | 'MAXIMAL';
  readonly conservationReplayJours: number;
  readonly reconstructionTimelineActivee: boolean;
  readonly retentionForensicJours: number;
}

export interface AuditAnalyticsConfiguration {
  readonly frequenceAgregationMinutes: number;
  readonly seuilAnomalies: number;
  readonly retentionAnalyticsJours: number;
  readonly batchAnalytics: number;
  readonly refreshDashboardsMinutes: number;
}

export interface AuditTenantsConfiguration {
  readonly heritageActif: boolean;
  readonly overrideControle: boolean;
  readonly isolationStricte: boolean;
  readonly niveauxAutorises: readonly AuditConfigurationScopeLevel[];
}

export interface AuditCachingConfiguration {
  readonly ttlSeconds: number;
  readonly maxEntries: number;
  readonly invalidationSurEcriture: boolean;
}

export interface AuditRecoveryConfiguration {
  readonly rollbackActive: boolean;
  readonly maxSnapshots: number;
  readonly restoreWindowDays: number;
  readonly replayConfigurationActive: boolean;
}

export interface AuditInfrastructureConfiguration {
  readonly runtime: AuditRuntimeConfiguration;
  readonly retention: AuditRetentionConfiguration;
  readonly replay: AuditReplayConfiguration;
  readonly retry: AuditRetryConfiguration;
  readonly exports: AuditExportsConfiguration;
  readonly synchronization: AuditSynchronizationConfiguration;
  readonly monitoring: AuditMonitoringConfiguration;
  readonly security: AuditSecurityConfiguration;
  readonly workers: AuditWorkersConfiguration;
  readonly queues: AuditQueuesConfiguration;
  readonly forensic: AuditForensicConfiguration;
  readonly analytics: AuditAnalyticsConfiguration;
  readonly tenants: AuditTenantsConfiguration;
  readonly caching: AuditCachingConfiguration;
  readonly recovery: AuditRecoveryConfiguration;
}

export interface AuditInfrastructureConfigurationPatch {
  readonly runtime?: Partial<AuditRuntimeConfiguration>;
  readonly retention?: Partial<AuditRetentionConfiguration>;
  readonly replay?: Partial<AuditReplayConfiguration>;
  readonly retry?: Partial<AuditRetryConfiguration>;
  readonly exports?: Partial<AuditExportsConfiguration>;
  readonly synchronization?: Partial<AuditSynchronizationConfiguration>;
  readonly monitoring?: Partial<AuditMonitoringConfiguration>;
  readonly security?: Partial<AuditSecurityConfiguration>;
  readonly workers?: Partial<AuditWorkersConfiguration>;
  readonly queues?: Partial<AuditQueuesConfiguration>;
  readonly forensic?: Partial<AuditForensicConfiguration>;
  readonly analytics?: Partial<AuditAnalyticsConfiguration>;
  readonly tenants?: Partial<AuditTenantsConfiguration>;
  readonly caching?: Partial<AuditCachingConfiguration>;
  readonly recovery?: Partial<AuditRecoveryConfiguration>;
}

export interface AuditConfigurationChangeMetadata {
  readonly auteur?: string;
  readonly raison?: string;
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly sessionId?: string;
  readonly deviceId?: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly replayId?: string;
  readonly retryCount?: number;
  readonly syncId?: string;
  readonly rollbackVersion?: string;
}

export interface AuditConfigurationSnapshot {
  readonly version: string;
  readonly previousVersion?: string;
  readonly scope: AuditConfigurationScope;
  readonly patch: AuditInfrastructureConfigurationPatch;
  readonly fingerprint: string;
  readonly changedAt: string;
  readonly changedBy?: string;
  readonly reason?: string;
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly sessionId?: string;
  readonly deviceId?: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly replayId?: string;
  readonly retryCount?: number;
  readonly syncId?: string;
  readonly rollbackVersion?: string;
}

export type AuditConfigurationEventName =
  | 'ConfigurationChanged'
  | 'RetentionPolicyUpdated'
  | 'ReplayLimitsUpdated'
  | 'QueueSettingsChanged'
  | 'SecurityPolicyUpdated';

export interface AuditConfigurationChangeEvent {
  readonly name: AuditConfigurationEventName;
  readonly version: string;
  readonly previousVersion?: string;
  readonly scope: AuditConfigurationScope;
  readonly changedAt: string;
  readonly changedBy?: string;
  readonly reason?: string;
  readonly sections: readonly string[];
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly sessionId?: string;
  readonly deviceId?: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly replayId?: string;
  readonly retryCount?: number;
  readonly syncId?: string;
  readonly rollbackVersion?: string;
}

export interface AuditResolvedConfiguration {
  readonly scope: AuditConfigurationScope;
  readonly configuration: AuditInfrastructureConfiguration;
  readonly versionChain: readonly string[];
  readonly sourceScopes: readonly AuditConfigurationScope[];
  readonly resolvedAt: string;
}

export interface AuditConfigurationDiff {
  readonly versionA: string;
  readonly versionB: string;
  readonly sections: readonly string[];
}
