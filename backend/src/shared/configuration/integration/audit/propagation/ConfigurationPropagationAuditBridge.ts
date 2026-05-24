import { obtenirConfigurationAuditMemoryStore } from '../store/ConfigurationAuditMemoryStore';

export class ConfigurationPropagationAuditBridge {
  public obtenirSnapshot() {
    const records = obtenirConfigurationAuditMemoryStore().records;
    return {
      totalPropagationStarted: records.filter((record) => record.name === 'ConfigurationPropagationStarted').length,
      totalPropagationCompleted: records.filter((record) => record.name === 'ConfigurationPropagationCompleted').length,
      totalPropagationFailed: records.filter((record) => record.name === 'ConfigurationPropagationFailed').length,
    };
  }
}
