import { obtenirConfigurationAuditMemoryStore } from '../store/ConfigurationAuditMemoryStore';

export class ConfigurationForensicAuditBridge {
  public listerChronologie(configurationId: string) {
    return obtenirConfigurationAuditMemoryStore().records
      .filter((record) => record.configurationId === configurationId)
      .sort((left, right) => left.changedAt.localeCompare(right.changedAt));
  }
}
