import { obtenirConfigurationAuditMemoryStore } from '../store/ConfigurationAuditMemoryStore';

export class ConfigurationRollbackAuditBridge {
  public obtenirSnapshot() {
    const records = obtenirConfigurationAuditMemoryStore().records;
    return {
      totalRollbackRequested: records.filter((record) => record.name === 'ConfigurationRollbackRequested').length,
      totalRollbackApplied: records.filter((record) => record.name === 'ConfigurationRollbackApplied').length,
      totalRollbackFailed: records.filter((record) => record.name === 'ConfigurationRollbackFailed').length,
    };
  }
}
