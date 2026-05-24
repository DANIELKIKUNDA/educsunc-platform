import { obtenirConfigurationAuditMemoryStore } from '../store/ConfigurationAuditMemoryStore';

export class ConfigurationRuntimeAuditBridge {
  public obtenirSnapshot() {
    const records = obtenirConfigurationAuditMemoryStore().records;
    return {
      totalRuntimeChanges: records.filter((record) => /Runtime|VersionChanged/.test(record.name)).length,
      totalActivated: records.filter((record) => record.name === 'ConfigurationRuntimeActivated').length,
      totalReloaded: records.filter((record) => record.name === 'ConfigurationReloaded').length,
    };
  }
}
