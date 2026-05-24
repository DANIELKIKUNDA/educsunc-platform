import { obtenirConfigurationAuditMemoryStore } from '../store/ConfigurationAuditMemoryStore';

export class ConfigurationRetentionAuditBridge {
  public obtenirSnapshot() {
    const records = obtenirConfigurationAuditMemoryStore().records;
    return {
      totalRetentionChanges: records.filter((record) => record.name === 'ConfigurationRetentionPolicyChanged').length,
      totalRollbackRetention: records.filter(
        (record) =>
          record.name === 'ConfigurationRollbackApplied' && Boolean(record.rollbackVersion),
      ).length,
    };
  }
}
