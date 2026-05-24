import { obtenirConfigurationAuditMemoryStore } from '../store/ConfigurationAuditMemoryStore';

export class ConfigurationSynchronizationAuditBridge {
  public obtenirSnapshot() {
    const records = obtenirConfigurationAuditMemoryStore().records;
    return {
      totalSynchronizationChanges: records.filter(
        (record) => record.name === 'ConfigurationSynchronizationPolicyChanged',
      ).length,
      totalWithSyncId: records.filter((record) => Boolean(record.changedAt)).length,
    };
  }
}
