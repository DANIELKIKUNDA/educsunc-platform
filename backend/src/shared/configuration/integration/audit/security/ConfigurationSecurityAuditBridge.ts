import { obtenirConfigurationAuditMemoryStore } from '../store/ConfigurationAuditMemoryStore';

export class ConfigurationSecurityAuditBridge {
  public obtenirSnapshot() {
    const records = obtenirConfigurationAuditMemoryStore().records;
    return {
      totalSecurityChanges: records.filter((record) => record.name === 'ConfigurationSecurityPolicyChanged').length,
      totalScoped: records.filter((record) => Boolean(record.organisationId || record.ecoleId)).length,
    };
  }
}
