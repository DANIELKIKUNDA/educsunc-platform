import type { ConfigurationAuditSnapshot } from '../ConfigurationAuditIntegrationTypes';
import { obtenirConfigurationAuditMemoryStore } from '../store/ConfigurationAuditMemoryStore';

export class ConfigurationMonitoringAuditBridge {
  public obtenirSnapshot(): ConfigurationAuditSnapshot {
    const records = obtenirConfigurationAuditMemoryStore().records;
    return {
      totalEvents: records.length,
      runtimeChanges: records.filter((record) => /Runtime|VersionChanged/.test(record.name)).length,
      propagationEvents: records.filter((record) => /Propagation/.test(record.name)).length,
      rollbackEvents: records.filter((record) => /Rollback/.test(record.name)).length,
      replayChanges: records.filter((record) => record.name === 'ConfigurationReplayPolicyChanged').length,
      retryChanges: records.filter((record) => record.name === 'ConfigurationRetryPolicyChanged').length,
      monitoringChanges: records.filter((record) => record.name === 'ConfigurationMonitoringPolicyChanged').length,
      synchronizationChanges: records.filter((record) => record.name === 'ConfigurationSynchronizationPolicyChanged').length,
      retentionChanges: records.filter((record) => record.name === 'ConfigurationRetentionPolicyChanged').length,
      securityChanges: records.filter((record) => record.name === 'ConfigurationSecurityPolicyChanged').length,
      workerQueueChanges: records.filter(
        (record) =>
          record.name === 'ConfigurationWorkersPolicyChanged' ||
          record.name === 'ConfigurationQueuesPolicyChanged',
      ).length,
      featureFlagChanges: records.filter((record) => record.name === 'ConfigurationFeatureFlagChanged').length,
    };
  }
}
