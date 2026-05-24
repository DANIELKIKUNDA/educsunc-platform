import { obtenirAuditConfigurationMemoryStore } from './AuditConfigurationMemoryStore';
import { AuditConfigurationCache } from './caching/AuditConfigurationCache';
import { AuditCachingConfigurationService } from './caching/AuditCachingConfigurationService';
import type {
  AuditConfigurationChangeEvent,
  AuditConfigurationChangeMetadata,
  AuditConfigurationScope,
  AuditConfigurationSnapshot,
  AuditInfrastructureConfiguration,
  AuditInfrastructureConfigurationPatch,
  AuditResolvedConfiguration,
} from './ConfigurationTypes';
import { AuditAnalyticsConfigurationService } from './analytics/AuditAnalyticsConfigurationService';
import { AuditExportsConfigurationService } from './exports/AuditExportsConfigurationService';
import { AuditForensicConfigurationService } from './forensic/AuditForensicConfigurationService';
import { AuditMonitoringConfigurationService } from './monitoring/AuditMonitoringConfigurationService';
import { AuditQueuesConfigurationService } from './queues/AuditQueuesConfigurationService';
import { AuditRecoveryConfigurationService } from './recovery/AuditRecoveryConfigurationService';
import { AuditConfigurationRecoveryService } from './recovery/AuditConfigurationRecoveryService';
import { AuditReplayConfigurationService } from './replay/AuditReplayConfigurationService';
import { AuditRetentionConfigurationService } from './retention/AuditRetentionConfigurationService';
import { AuditRetryConfigurationService } from './retry/AuditRetryConfigurationService';
import { AuditRuntimeConfigurationService } from './runtime/AuditRuntimeConfigurationService';
import { AuditSecurityConfigurationService } from './security/AuditSecurityConfigurationService';
import { AuditSynchronizationConfigurationService } from './synchronization/AuditSynchronizationConfigurationService';
import { AuditTenantConfigurationService } from './tenants/AuditTenantConfigurationService';
import { AuditTenantsConfigurationService } from './tenants/AuditTenantsConfigurationService';
import { AuditConfigurationValidationService } from './validation/AuditConfigurationValidationService';
import { AuditConfigurationVersioningService } from './versioning/AuditConfigurationVersioningService';
import { AuditWorkersConfigurationService } from './workers/AuditWorkersConfigurationService';
import { ConfigurationAuditIntegrationOrchestrator } from 'shared/configuration';

export class AuditConfigurationFacade {
  public constructor(
    private readonly runtime: AuditRuntimeConfigurationService = new AuditRuntimeConfigurationService(),
    private readonly retention: AuditRetentionConfigurationService = new AuditRetentionConfigurationService(),
    private readonly replay: AuditReplayConfigurationService = new AuditReplayConfigurationService(),
    private readonly retry: AuditRetryConfigurationService = new AuditRetryConfigurationService(),
    private readonly exportsConfig: AuditExportsConfigurationService = new AuditExportsConfigurationService(),
    private readonly synchronization: AuditSynchronizationConfigurationService = new AuditSynchronizationConfigurationService(),
    private readonly monitoring: AuditMonitoringConfigurationService = new AuditMonitoringConfigurationService(),
    private readonly security: AuditSecurityConfigurationService = new AuditSecurityConfigurationService(),
    private readonly workers: AuditWorkersConfigurationService = new AuditWorkersConfigurationService(),
    private readonly queues: AuditQueuesConfigurationService = new AuditQueuesConfigurationService(),
    private readonly forensic: AuditForensicConfigurationService = new AuditForensicConfigurationService(),
    private readonly analytics: AuditAnalyticsConfigurationService = new AuditAnalyticsConfigurationService(),
    private readonly tenantsConfig: AuditTenantsConfigurationService = new AuditTenantsConfigurationService(),
    private readonly caching: AuditCachingConfigurationService = new AuditCachingConfigurationService(),
    private readonly recoveryConfig: AuditRecoveryConfigurationService = new AuditRecoveryConfigurationService(),
    private readonly validation: AuditConfigurationValidationService = new AuditConfigurationValidationService(),
    private readonly versioning: AuditConfigurationVersioningService = new AuditConfigurationVersioningService(),
    private readonly tenantResolver: AuditTenantConfigurationService = new AuditTenantConfigurationService(),
    private readonly cache: AuditConfigurationCache = new AuditConfigurationCache(),
    private readonly recovery: AuditConfigurationRecoveryService = new AuditConfigurationRecoveryService(),
    private readonly integration: ConfigurationAuditIntegrationOrchestrator = new ConfigurationAuditIntegrationOrchestrator(),
  ) {}

  public obtenirParDefaut(): AuditInfrastructureConfiguration {
    return {
      runtime: this.runtime.obtenirParDefaut(),
      retention: this.retention.obtenirParDefaut(),
      replay: this.replay.obtenirParDefaut(),
      retry: this.retry.obtenirParDefaut(),
      exports: this.exportsConfig.obtenirParDefaut(),
      synchronization: this.synchronization.obtenirParDefaut(),
      monitoring: this.monitoring.obtenirParDefaut(),
      security: this.security.obtenirParDefaut(),
      workers: this.workers.obtenirParDefaut(),
      queues: this.queues.obtenirParDefaut(),
      forensic: this.forensic.obtenirParDefaut(),
      analytics: this.analytics.obtenirParDefaut(),
      tenants: this.tenantsConfig.obtenirParDefaut(),
      caching: this.caching.obtenirParDefaut(),
      recovery: this.recoveryConfig.obtenirParDefaut(),
    };
  }

  public resoudre(scope: AuditConfigurationScope): AuditResolvedConfiguration {
    this.validation.validerScope(scope);
    const enCache = this.cache.lire(scope);
    if (enCache) {
      return enCache;
    }

    let resolved = this.obtenirParDefaut();
    const versionChain: string[] = [];
    const sourceScopes: AuditConfigurationScope[] = [];
    const store = obtenirAuditConfigurationMemoryStore();
    for (const candidateScope of this.tenantResolver.resoudreScopesApplicables(scope)) {
      const snapshot = store.current.get(this.tenantResolver.composerCle(candidateScope));
      if (!snapshot) {
        continue;
      }

      resolved = this.appliquerPatch(resolved, snapshot.patch);
      versionChain.push(snapshot.version);
      sourceScopes.push(snapshot.scope);
    }

    this.validation.validerConfiguration(resolved);
    const finalResolved: AuditResolvedConfiguration = {
      scope,
      configuration: resolved,
      versionChain,
      sourceScopes,
      resolvedAt: new Date().toISOString(),
    };
    this.cache.ecrire(scope, finalResolved);
    return finalResolved;
  }

  public enregistrer(
    scope: AuditConfigurationScope,
    patch: AuditInfrastructureConfigurationPatch,
    metadata: AuditConfigurationChangeMetadata = {},
  ): AuditConfigurationSnapshot {
    this.validation.validerScope(scope);
    const normalise = this.normaliserPatch(patch);
    const candidat = this.appliquerPatch(this.resoudre(scope).configuration, normalise);
    this.validation.validerConfiguration(candidat);
    const snapshot = this.versioning.enregistrer(scope, normalise, metadata);
    this.cache.invalider(scope);
    this.publierEvenements(scope, normalise, snapshot, metadata);
    return snapshot;
  }

  public rollback(version: string, metadata: AuditConfigurationChangeMetadata = {}): AuditConfigurationSnapshot {
    void this.integration.publier({
      name: 'ConfigurationRollbackRequested',
      payload: { rollbackVersion: version },
      configurationContext: this.construireContexteRuntime(
        this.recovery.obtenirScopeDepuisVersion(version),
        version,
        undefined,
        undefined,
        metadata,
      ),
    });
    const snapshot = this.recovery.restaurer(version, metadata);
    this.publierEvenements(snapshot.scope, snapshot.patch, snapshot, metadata);
    return snapshot;
  }

  public listerHistorique(scope?: AuditConfigurationScope): AuditConfigurationSnapshot[] {
    return this.versioning.listerHistorique(scope);
  }

  public listerEvenements(): AuditConfigurationChangeEvent[] {
    return [...obtenirAuditConfigurationMemoryStore().events];
  }

  public comparer(versionA: string, versionB: string) {
    return this.versioning.comparer(versionA, versionB);
  }

  private normaliserPatch(patch: AuditInfrastructureConfigurationPatch): AuditInfrastructureConfigurationPatch {
    return {
      runtime: patch.runtime ? this.runtime.normaliser(patch.runtime) : undefined,
      retention: patch.retention ? this.retention.normaliser(patch.retention) : undefined,
      replay: patch.replay ? this.replay.normaliser(patch.replay) : undefined,
      retry: patch.retry ? this.retry.normaliser(patch.retry) : undefined,
      exports: patch.exports ? this.exportsConfig.normaliser(patch.exports) : undefined,
      synchronization: patch.synchronization ? this.synchronization.normaliser(patch.synchronization) : undefined,
      monitoring: patch.monitoring ? this.monitoring.normaliser(patch.monitoring) : undefined,
      security: patch.security ? this.security.normaliser(patch.security) : undefined,
      workers: patch.workers ? this.workers.normaliser(patch.workers) : undefined,
      queues: patch.queues ? this.queues.normaliser(patch.queues) : undefined,
      forensic: patch.forensic ? this.forensic.normaliser(patch.forensic) : undefined,
      analytics: patch.analytics ? this.analytics.normaliser(patch.analytics) : undefined,
      tenants: patch.tenants ? this.tenantsConfig.normaliser(patch.tenants) : undefined,
      caching: patch.caching ? this.caching.normaliser(patch.caching) : undefined,
      recovery: patch.recovery ? this.recoveryConfig.normaliser(patch.recovery) : undefined,
    };
  }

  private appliquerPatch(
    configuration: AuditInfrastructureConfiguration,
    patch: AuditInfrastructureConfigurationPatch,
  ): AuditInfrastructureConfiguration {
    return {
      runtime: patch.runtime ? this.runtime.normaliser({ ...configuration.runtime, ...patch.runtime }) : configuration.runtime,
      retention: patch.retention
        ? this.retention.normaliser({ ...configuration.retention, ...patch.retention })
        : configuration.retention,
      replay: patch.replay ? this.replay.normaliser({ ...configuration.replay, ...patch.replay }) : configuration.replay,
      retry: patch.retry ? this.retry.normaliser({ ...configuration.retry, ...patch.retry }) : configuration.retry,
      exports: patch.exports
        ? this.exportsConfig.normaliser({ ...configuration.exports, ...patch.exports })
        : configuration.exports,
      synchronization: patch.synchronization
        ? this.synchronization.normaliser({ ...configuration.synchronization, ...patch.synchronization })
        : configuration.synchronization,
      monitoring: patch.monitoring
        ? this.monitoring.normaliser({ ...configuration.monitoring, ...patch.monitoring })
        : configuration.monitoring,
      security: patch.security
        ? this.security.normaliser({ ...configuration.security, ...patch.security })
        : configuration.security,
      workers: patch.workers
        ? this.workers.normaliser({ ...configuration.workers, ...patch.workers })
        : configuration.workers,
      queues: patch.queues ? this.queues.normaliser({ ...configuration.queues, ...patch.queues }) : configuration.queues,
      forensic: patch.forensic
        ? this.forensic.normaliser({ ...configuration.forensic, ...patch.forensic })
        : configuration.forensic,
      analytics: patch.analytics
        ? this.analytics.normaliser({ ...configuration.analytics, ...patch.analytics })
        : configuration.analytics,
      tenants: patch.tenants
        ? this.tenantsConfig.normaliser({ ...configuration.tenants, ...patch.tenants })
        : configuration.tenants,
      caching: patch.caching
        ? this.caching.normaliser({ ...configuration.caching, ...patch.caching })
        : configuration.caching,
      recovery: patch.recovery
        ? this.recoveryConfig.normaliser({ ...configuration.recovery, ...patch.recovery })
        : configuration.recovery,
    };
  }

  private publierEvenements(
    scope: AuditConfigurationScope,
    patch: AuditInfrastructureConfigurationPatch,
    snapshot: AuditConfigurationSnapshot,
    metadata: AuditConfigurationChangeMetadata,
  ): void {
    const sections = Object.keys(patch) as Array<keyof AuditInfrastructureConfigurationPatch>;
    const events: AuditConfigurationChangeEvent[] = [
      {
        name: 'ConfigurationChanged',
        version: snapshot.version,
        previousVersion: snapshot.previousVersion,
        scope,
        changedAt: snapshot.changedAt,
        changedBy: metadata.auteur,
        reason: metadata.raison,
        sections,
        correlationId: snapshot.correlationId,
        requestId: snapshot.requestId,
        sessionId: snapshot.sessionId,
        deviceId: snapshot.deviceId,
        organisationId: snapshot.organisationId,
        ecoleId: snapshot.ecoleId,
        replayId: snapshot.replayId,
        retryCount: snapshot.retryCount,
        syncId: snapshot.syncId,
        rollbackVersion: snapshot.rollbackVersion,
      },
    ];

    if (patch.retention) {
      events.push({
        name: 'RetentionPolicyUpdated',
        version: snapshot.version,
        previousVersion: snapshot.previousVersion,
        scope,
        changedAt: snapshot.changedAt,
        changedBy: metadata.auteur,
        reason: metadata.raison,
        sections: ['retention'],
        correlationId: snapshot.correlationId,
        requestId: snapshot.requestId,
        sessionId: snapshot.sessionId,
        deviceId: snapshot.deviceId,
        organisationId: snapshot.organisationId,
        ecoleId: snapshot.ecoleId,
        replayId: snapshot.replayId,
        retryCount: snapshot.retryCount,
        syncId: snapshot.syncId,
        rollbackVersion: snapshot.rollbackVersion,
      });
    }
    if (patch.replay || patch.retry) {
      events.push({
        name: 'ReplayLimitsUpdated',
        version: snapshot.version,
        previousVersion: snapshot.previousVersion,
        scope,
        changedAt: snapshot.changedAt,
        changedBy: metadata.auteur,
        reason: metadata.raison,
        sections: [patch.replay ? 'replay' : '', patch.retry ? 'retry' : ''].filter(Boolean),
        correlationId: snapshot.correlationId,
        requestId: snapshot.requestId,
        sessionId: snapshot.sessionId,
        deviceId: snapshot.deviceId,
        organisationId: snapshot.organisationId,
        ecoleId: snapshot.ecoleId,
        replayId: snapshot.replayId,
        retryCount: snapshot.retryCount,
        syncId: snapshot.syncId,
        rollbackVersion: snapshot.rollbackVersion,
      });
    }
    if (patch.queues || patch.workers) {
      events.push({
        name: 'QueueSettingsChanged',
        version: snapshot.version,
        previousVersion: snapshot.previousVersion,
        scope,
        changedAt: snapshot.changedAt,
        changedBy: metadata.auteur,
        reason: metadata.raison,
        sections: [patch.queues ? 'queues' : '', patch.workers ? 'workers' : ''].filter(Boolean),
        correlationId: snapshot.correlationId,
        requestId: snapshot.requestId,
        sessionId: snapshot.sessionId,
        deviceId: snapshot.deviceId,
        organisationId: snapshot.organisationId,
        ecoleId: snapshot.ecoleId,
        replayId: snapshot.replayId,
        retryCount: snapshot.retryCount,
        syncId: snapshot.syncId,
        rollbackVersion: snapshot.rollbackVersion,
      });
    }
    if (patch.security) {
      events.push({
        name: 'SecurityPolicyUpdated',
        version: snapshot.version,
        previousVersion: snapshot.previousVersion,
        scope,
        changedAt: snapshot.changedAt,
        changedBy: metadata.auteur,
        reason: metadata.raison,
        sections: ['security'],
        correlationId: snapshot.correlationId,
        requestId: snapshot.requestId,
        sessionId: snapshot.sessionId,
        deviceId: snapshot.deviceId,
        organisationId: snapshot.organisationId,
        ecoleId: snapshot.ecoleId,
        replayId: snapshot.replayId,
        retryCount: snapshot.retryCount,
        syncId: snapshot.syncId,
        rollbackVersion: snapshot.rollbackVersion,
      });
    }

    obtenirAuditConfigurationMemoryStore().events.push(...events);
    void this.publierIntegration(scope, patch, snapshot, metadata);
  }

  private construireContexteRuntime(
    scope: AuditConfigurationScope,
    configurationId: string,
    snapshot: AuditConfigurationSnapshot | undefined,
    eventName: string | undefined,
    metadata: AuditConfigurationChangeMetadata,
  ) {
    void eventName;
    return {
      configurationId,
      scopeLevel: scope.niveau,
      environnement: scope.environnement,
      organisationId: metadata.organisationId ?? scope.organisationId,
      ecoleId: metadata.ecoleId ?? scope.ecoleId,
      actorId: metadata.auteur,
      requestId: metadata.requestId,
      correlationId: metadata.correlationId,
      sessionId: metadata.sessionId,
      deviceId: metadata.deviceId,
      replayId: metadata.replayId,
      retryCount: metadata.retryCount,
      syncId: metadata.syncId,
      rollbackVersion: metadata.rollbackVersion ?? snapshot?.rollbackVersion,
      previousVersion: snapshot?.previousVersion,
      nextVersion: snapshot?.version,
      changedAt: snapshot?.changedAt ?? new Date().toISOString(),
    };
  }

  private async publierIntegration(
    scope: AuditConfigurationScope,
    patch: AuditInfrastructureConfigurationPatch,
    snapshot: AuditConfigurationSnapshot,
    metadata: AuditConfigurationChangeMetadata,
  ): Promise<void> {
    const baseContext = this.construireContexteRuntime(scope, snapshot.version, snapshot, undefined, metadata);

    await this.integration.publier({
      name: 'ConfigurationVersionChanged',
      payload: { sections: Object.keys(patch) },
      configurationContext: baseContext,
    });

    if (patch.runtime) {
      await this.integration.publier({
        name: 'ConfigurationRuntimeActivated',
        payload: { runtime: patch.runtime },
        configurationContext: baseContext,
      });
      await this.integration.publier({
        name: 'ConfigurationReloaded',
        payload: { runtime: patch.runtime },
        configurationContext: baseContext,
      });
    }
    if (patch.replay) {
      await this.integration.publier({
        name: 'ConfigurationReplayPolicyChanged',
        payload: { replay: patch.replay },
        configurationContext: baseContext,
      });
    }
    if (patch.retry) {
      await this.integration.publier({
        name: 'ConfigurationRetryPolicyChanged',
        payload: { retry: patch.retry },
        configurationContext: baseContext,
      });
    }
    if (patch.monitoring) {
      await this.integration.publier({
        name: 'ConfigurationMonitoringPolicyChanged',
        payload: { monitoring: patch.monitoring },
        configurationContext: baseContext,
      });
    }
    if (patch.synchronization) {
      await this.integration.publier({
        name: 'ConfigurationSynchronizationPolicyChanged',
        payload: { synchronization: patch.synchronization },
        configurationContext: baseContext,
      });
    }
    if (patch.retention) {
      await this.integration.publier({
        name: 'ConfigurationRetentionPolicyChanged',
        payload: { retention: patch.retention },
        configurationContext: baseContext,
      });
    }
    if (patch.security) {
      await this.integration.publier({
        name: 'ConfigurationSecurityPolicyChanged',
        payload: { security: patch.security },
        configurationContext: baseContext,
      });
    }
    if (patch.workers) {
      await this.integration.publier({
        name: 'ConfigurationWorkersPolicyChanged',
        payload: { workers: patch.workers },
        configurationContext: baseContext,
      });
    }
    if (patch.queues) {
      await this.integration.publier({
        name: 'ConfigurationQueuesPolicyChanged',
        payload: { queues: patch.queues },
        configurationContext: baseContext,
      });
    }
    if (patch.analytics) {
      await this.integration.publier({
        name: 'ConfigurationFeatureFlagChanged',
        payload: { analytics: patch.analytics },
        configurationContext: baseContext,
      });
    }

    await this.integration.publier({
      name: 'ConfigurationPropagationStarted',
      payload: { sections: Object.keys(patch) },
      configurationContext: baseContext,
    });
    await this.integration.publier({
      name: 'ConfigurationPropagationCompleted',
      payload: { sections: Object.keys(patch) },
      configurationContext: baseContext,
    });

    if (metadata.rollbackVersion) {
      await this.integration.publier({
        name: 'ConfigurationRollbackApplied',
        payload: { rollbackVersion: metadata.rollbackVersion },
        configurationContext: baseContext,
      });
    }
  }
}
