import { obtenirConfigurationAuditMemoryStore } from '../store/ConfigurationAuditMemoryStore';

export class ConfigurationWorkersAuditBridge {
  public obtenirSnapshot() {
    const records = obtenirConfigurationAuditMemoryStore().records;
    return {
      totalWorkersChanges: records.filter((record) => record.name === 'ConfigurationWorkersPolicyChanged').length,
      totalQueueChanges: records.filter((record) => record.name === 'ConfigurationQueuesPolicyChanged').length,
    };
  }
}
