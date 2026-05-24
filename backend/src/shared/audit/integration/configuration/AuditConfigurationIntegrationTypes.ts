import type { ConfigurationAuditSnapshot } from 'shared/configuration';

export interface AuditConfigurationIntegrationSnapshot {
  readonly monitoring: ConfigurationAuditSnapshot;
  readonly runtime: Record<string, unknown>;
  readonly propagation: Record<string, unknown>;
  readonly replay: Record<string, unknown>;
  readonly retry: Record<string, unknown>;
  readonly synchronization: Record<string, unknown>;
  readonly retention: Record<string, unknown>;
  readonly security: Record<string, unknown>;
  readonly workers: Record<string, unknown>;
  readonly queues: Record<string, unknown>;
  readonly featureFlags: Record<string, unknown>;
  readonly rollback: Record<string, unknown>;
  readonly versioning: Record<string, unknown>;
  readonly analytics: Record<string, unknown>;
  readonly observability: Record<string, unknown>;
}
