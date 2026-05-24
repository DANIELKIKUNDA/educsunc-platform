import type {
  AuditConfigurationChangeEvent,
  AuditConfigurationSnapshot,
  AuditResolvedConfiguration,
} from './ConfigurationTypes';

interface AuditConfigurationMemoryStore {
  readonly current: Map<string, AuditConfigurationSnapshot>;
  readonly history: AuditConfigurationSnapshot[];
  readonly cache: Map<string, AuditResolvedConfiguration>;
  readonly events: AuditConfigurationChangeEvent[];
}

const store: AuditConfigurationMemoryStore = {
  current: new Map<string, AuditConfigurationSnapshot>(),
  history: [],
  cache: new Map<string, AuditResolvedConfiguration>(),
  events: [],
};

export function obtenirAuditConfigurationMemoryStore(): AuditConfigurationMemoryStore {
  return store;
}
