import type {
  ConfigurationAuditPublishRequest,
  ConfigurationAuditSnapshot,
} from '../ConfigurationAuditIntegrationTypes';
import { ConfigurationAnalyticsAuditBridge } from '../analytics/ConfigurationAnalyticsAuditBridge';
import { ConfigurationFeatureFlagsAuditBridge } from '../feature-flags/ConfigurationFeatureFlagsAuditBridge';
import { ConfigurationForensicAuditBridge } from '../forensic/ConfigurationForensicAuditBridge';
import { ConfigurationMonitoringAuditBridge } from '../monitoring/ConfigurationMonitoringAuditBridge';
import { ConfigurationObservabilityAuditBridge } from '../observability/ConfigurationObservabilityAuditBridge';
import { ConfigurationPropagationAuditBridge } from '../propagation/ConfigurationPropagationAuditBridge';
import { ConfigurationAuditEventPublisher } from '../publishers/ConfigurationAuditEventPublisher';
import { ConfigurationQueuesAuditBridge } from '../queues/ConfigurationQueuesAuditBridge';
import { ConfigurationReplayAuditBridge } from '../replay/ConfigurationReplayAuditBridge';
import { ConfigurationRetentionAuditBridge } from '../retention/ConfigurationRetentionAuditBridge';
import { ConfigurationRetryAuditBridge } from '../retry/ConfigurationRetryAuditBridge';
import { ConfigurationRollbackAuditBridge } from '../rollback/ConfigurationRollbackAuditBridge';
import { ConfigurationRuntimeAuditBridge } from '../runtime/ConfigurationRuntimeAuditBridge';
import { ConfigurationSecurityAuditBridge } from '../security/ConfigurationSecurityAuditBridge';
import { ConfigurationSynchronizationAuditBridge } from '../synchronization/ConfigurationSynchronizationAuditBridge';
import { ConfigurationVersioningAuditBridge } from '../versioning/ConfigurationVersioningAuditBridge';
import { ConfigurationWorkersAuditBridge } from '../workers/ConfigurationWorkersAuditBridge';

export class ConfigurationAuditIntegrationOrchestrator {
  public readonly publisher = new ConfigurationAuditEventPublisher();
  public readonly runtime = new ConfigurationRuntimeAuditBridge();
  public readonly propagation = new ConfigurationPropagationAuditBridge();
  public readonly replay = new ConfigurationReplayAuditBridge();
  public readonly retry = new ConfigurationRetryAuditBridge();
  public readonly monitoring = new ConfigurationMonitoringAuditBridge();
  public readonly synchronization = new ConfigurationSynchronizationAuditBridge();
  public readonly retention = new ConfigurationRetentionAuditBridge();
  public readonly security = new ConfigurationSecurityAuditBridge();
  public readonly workers = new ConfigurationWorkersAuditBridge();
  public readonly queues = new ConfigurationQueuesAuditBridge();
  public readonly featureFlags = new ConfigurationFeatureFlagsAuditBridge();
  public readonly rollback = new ConfigurationRollbackAuditBridge();
  public readonly versioning = new ConfigurationVersioningAuditBridge();
  public readonly forensic = new ConfigurationForensicAuditBridge();
  public readonly analytics = new ConfigurationAnalyticsAuditBridge();
  public readonly observability = new ConfigurationObservabilityAuditBridge();

  public async publier(request: ConfigurationAuditPublishRequest) {
    return this.publisher.publier(request);
  }

  public obtenirSnapshot(): {
    monitoring: ConfigurationAuditSnapshot;
    runtime: ReturnType<ConfigurationRuntimeAuditBridge['obtenirSnapshot']>;
    propagation: ReturnType<ConfigurationPropagationAuditBridge['obtenirSnapshot']>;
    replay: ReturnType<ConfigurationReplayAuditBridge['obtenirSnapshot']>;
    retry: ReturnType<ConfigurationRetryAuditBridge['obtenirSnapshot']>;
    synchronization: ReturnType<ConfigurationSynchronizationAuditBridge['obtenirSnapshot']>;
    retention: ReturnType<ConfigurationRetentionAuditBridge['obtenirSnapshot']>;
    security: ReturnType<ConfigurationSecurityAuditBridge['obtenirSnapshot']>;
    workers: ReturnType<ConfigurationWorkersAuditBridge['obtenirSnapshot']>;
    queues: ReturnType<ConfigurationQueuesAuditBridge['obtenirSnapshot']>;
    featureFlags: ReturnType<ConfigurationFeatureFlagsAuditBridge['obtenirSnapshot']>;
    rollback: ReturnType<ConfigurationRollbackAuditBridge['obtenirSnapshot']>;
    versioning: ReturnType<ConfigurationVersioningAuditBridge['obtenirSnapshot']>;
    analytics: ReturnType<ConfigurationAnalyticsAuditBridge['obtenirSnapshot']>;
    observability: ReturnType<ConfigurationObservabilityAuditBridge['obtenirSnapshot']>;
  } {
    return {
      monitoring: this.monitoring.obtenirSnapshot(),
      runtime: this.runtime.obtenirSnapshot(),
      propagation: this.propagation.obtenirSnapshot(),
      replay: this.replay.obtenirSnapshot(),
      retry: this.retry.obtenirSnapshot(),
      synchronization: this.synchronization.obtenirSnapshot(),
      retention: this.retention.obtenirSnapshot(),
      security: this.security.obtenirSnapshot(),
      workers: this.workers.obtenirSnapshot(),
      queues: this.queues.obtenirSnapshot(),
      featureFlags: this.featureFlags.obtenirSnapshot(),
      rollback: this.rollback.obtenirSnapshot(),
      versioning: this.versioning.obtenirSnapshot(),
      analytics: this.analytics.obtenirSnapshot(),
      observability: this.observability.obtenirSnapshot(),
    };
  }
}
