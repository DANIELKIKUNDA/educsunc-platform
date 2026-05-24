import { obtenirConfigurationAuditMemoryStore } from '../store/ConfigurationAuditMemoryStore';

export class ConfigurationFeatureFlagsAuditBridge {
  public obtenirSnapshot() {
    const records = obtenirConfigurationAuditMemoryStore().records;
    return {
      totalFeatureFlagChanges: records.filter((record) => record.name === 'ConfigurationFeatureFlagChanged').length,
    };
  }
}
