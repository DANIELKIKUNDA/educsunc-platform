import { obtenirConfigurationAuditMemoryStore } from '../store/ConfigurationAuditMemoryStore';

export class ConfigurationRetryAuditBridge {
  public obtenirSnapshot() {
    const records = obtenirConfigurationAuditMemoryStore().records;
    return {
      totalRetryChanges: records.filter((record) => record.name === 'ConfigurationRetryPolicyChanged').length,
      totalRetryCount: records.reduce((sum, record) => sum + record.retryCount, 0),
    };
  }
}
