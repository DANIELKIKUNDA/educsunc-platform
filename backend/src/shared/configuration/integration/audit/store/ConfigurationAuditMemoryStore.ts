import type { ConfigurationAuditRecord } from '../ConfigurationAuditIntegrationTypes';

type ConfigurationAuditState = {
  records: ConfigurationAuditRecord[];
};

const state: ConfigurationAuditState = {
  records: [],
};

export function obtenirConfigurationAuditMemoryStore(): ConfigurationAuditState {
  return state;
}
