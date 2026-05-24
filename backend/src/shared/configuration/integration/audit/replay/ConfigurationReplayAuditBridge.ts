import { obtenirConfigurationAuditMemoryStore } from '../store/ConfigurationAuditMemoryStore';

export class ConfigurationReplayAuditBridge {
  public obtenirSnapshot() {
    const records = obtenirConfigurationAuditMemoryStore().records;
    return {
      totalReplayChanges: records.filter((record) => record.name === 'ConfigurationReplayPolicyChanged').length,
      totalWithReplayId: records.filter((record) => Boolean(record.replayId)).length,
    };
  }
}
