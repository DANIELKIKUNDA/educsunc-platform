import { obtenirConfigurationAuditMemoryStore } from '../store/ConfigurationAuditMemoryStore';

export class ConfigurationQueuesAuditBridge {
  public obtenirSnapshot() {
    const records = obtenirConfigurationAuditMemoryStore().records;
    return {
      totalQueuePolicies: records.filter((record) => record.name === 'ConfigurationQueuesPolicyChanged').length,
      totalPropagationEvents: records.filter((record) => /Propagation/.test(record.name)).length,
    };
  }
}
