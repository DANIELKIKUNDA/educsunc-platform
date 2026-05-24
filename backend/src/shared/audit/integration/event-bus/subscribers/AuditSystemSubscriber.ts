import type { SharedBusEventEnvelope } from '../../../../infrastructure/bus';
import type { AuditIntegrationSubscriber } from '../IntegrationEventBusTypes';
import { AuditRuntimeEventHandler } from '../handlers/AuditRuntimeEventHandler';

// Ce subscriber observe les evenements systeme majeurs que le moteur Audit doit corréler.
export class AuditSystemSubscriber implements AuditIntegrationSubscriber {
  public readonly eventNames = [
    'UserLoggedIn',
    'UserLoggedOut',
    'UserLoginLocked',
    'LoginFailed',
    'RefreshTokenUsed',
    'RefreshTokenRevoked',
    'SessionRevoked',
    'ContextChanged',
    'AuthOfflinePrepared',
    'PermissionGranted',
    'PermissionDenied',
    'SecurityIncidentDetected',
    'ScopeChanged',
    'ScopeDenied',
    'RestrictionTriggered',
    'TitulariatChanged',
    'BulletinGenerated',
    'PaiementValidated',
    'ExportDownloaded',
    'SyncCompleted',
    'WorkerFailed',
    'NotificationQueued',
    'NotificationSent',
    'NotificationFailed',
    'NotificationRetried',
    'NotificationDelivered',
    'NotificationRead',
    'NotificationReplayTriggered',
    'NotificationPreferenceChanged',
    'ConfigurationRuntimeActivated',
    'ConfigurationRuntimeDeactivated',
    'ConfigurationReloaded',
    'ConfigurationPropagationStarted',
    'ConfigurationPropagationCompleted',
    'ConfigurationPropagationFailed',
    'ConfigurationReplayPolicyChanged',
    'ConfigurationRetryPolicyChanged',
    'ConfigurationMonitoringPolicyChanged',
    'ConfigurationSynchronizationPolicyChanged',
    'ConfigurationRetentionPolicyChanged',
    'ConfigurationSecurityPolicyChanged',
    'ConfigurationWorkersPolicyChanged',
    'ConfigurationQueuesPolicyChanged',
    'ConfigurationFeatureFlagChanged',
    'ConfigurationRollbackRequested',
    'ConfigurationRollbackApplied',
    'ConfigurationRollbackFailed',
    'ConfigurationVersionChanged',
  ] as const;

  public constructor(private readonly handler: AuditRuntimeEventHandler) {}

  public async handle(envelope: SharedBusEventEnvelope): Promise<void> {
    await this.handler.handle(envelope);
  }
}
