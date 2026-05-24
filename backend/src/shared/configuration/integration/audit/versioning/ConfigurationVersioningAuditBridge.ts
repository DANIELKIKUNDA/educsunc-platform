import { obtenirConfigurationAuditMemoryStore } from '../store/ConfigurationAuditMemoryStore';

export class ConfigurationVersioningAuditBridge {
  public obtenirSnapshot() {
    const records = obtenirConfigurationAuditMemoryStore().records;
    return {
      totalVersionChanges: records.filter((record) => record.name === 'ConfigurationVersionChanged').length,
      totalWithPreviousVersion: records.filter((record) => Boolean(record.previousVersion)).length,
      totalWithNextVersion: records.filter((record) => Boolean(record.nextVersion)).length,
    };
  }
}
