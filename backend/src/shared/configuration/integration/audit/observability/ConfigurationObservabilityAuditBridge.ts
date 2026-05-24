import { obtenirConfigurationAuditMemoryStore } from '../store/ConfigurationAuditMemoryStore';

export class ConfigurationObservabilityAuditBridge {
  public obtenirSnapshot() {
    const records = obtenirConfigurationAuditMemoryStore().records;
    return {
      totalWithCorrelation: records.filter((record) => Boolean(record.correlationId)).length,
      totalWithRequest: records.filter((record) => Boolean(record.requestId)).length,
      totalWithActor: records.filter((record) => Boolean(record.actorId)).length,
    };
  }
}
