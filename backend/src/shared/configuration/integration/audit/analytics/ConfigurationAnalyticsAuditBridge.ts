import { obtenirConfigurationAuditMemoryStore } from '../store/ConfigurationAuditMemoryStore';

export class ConfigurationAnalyticsAuditBridge {
  public obtenirSnapshot() {
    const records = obtenirConfigurationAuditMemoryStore().records;
    return {
      totalScopes: new Set(records.map((record) => record.scopeLevel)).size,
      totalOrganisations: new Set(records.map((record) => record.organisationId).filter(Boolean)).size,
      totalEcoles: new Set(records.map((record) => record.ecoleId).filter(Boolean)).size,
    };
  }
}
