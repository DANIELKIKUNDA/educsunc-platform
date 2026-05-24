import type { ConfigurationContext } from '../../context';

export interface ConfigurationAuditPublishRequest {
  readonly name:
    | 'ConfigurationRuntimeActivated'
    | 'ConfigurationRuntimeDeactivated'
    | 'ConfigurationReloaded'
    | 'ConfigurationPropagationStarted'
    | 'ConfigurationPropagationCompleted'
    | 'ConfigurationPropagationFailed'
    | 'ConfigurationReplayPolicyChanged'
    | 'ConfigurationRetryPolicyChanged'
    | 'ConfigurationMonitoringPolicyChanged'
    | 'ConfigurationSynchronizationPolicyChanged'
    | 'ConfigurationRetentionPolicyChanged'
    | 'ConfigurationSecurityPolicyChanged'
    | 'ConfigurationWorkersPolicyChanged'
    | 'ConfigurationQueuesPolicyChanged'
    | 'ConfigurationFeatureFlagChanged'
    | 'ConfigurationRollbackRequested'
    | 'ConfigurationRollbackApplied'
    | 'ConfigurationRollbackFailed'
    | 'ConfigurationVersionChanged';
  readonly payload: Record<string, unknown>;
  readonly configurationContext: ConfigurationContext;
}

export interface ConfigurationAuditRecord {
  readonly name: ConfigurationAuditPublishRequest['name'];
  readonly configurationId: string;
  readonly scopeLevel: ConfigurationContext['scopeLevel'];
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly actorId?: string;
  readonly previousVersion?: string;
  readonly nextVersion?: string;
  readonly rollbackVersion?: string;
  readonly replayId?: string;
  readonly retryCount: number;
  readonly changedAt: string;
}

export interface ConfigurationAuditSnapshot {
  readonly totalEvents: number;
  readonly runtimeChanges: number;
  readonly propagationEvents: number;
  readonly rollbackEvents: number;
  readonly replayChanges: number;
  readonly retryChanges: number;
  readonly monitoringChanges: number;
  readonly synchronizationChanges: number;
  readonly retentionChanges: number;
  readonly securityChanges: number;
  readonly workerQueueChanges: number;
  readonly featureFlagChanges: number;
}
