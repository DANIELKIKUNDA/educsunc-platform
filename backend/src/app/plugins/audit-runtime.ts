import {
  AuditAnalyticsApplicationService,
  AuditCreationApplicationService,
  AuditExportApplicationService,
  AuditForensicApplicationService,
  AuditInvestigationApplicationService,
  AuditOfflineApplicationService,
  AuditProjectionApplicationService,
  AuditReplayApplicationService,
  AuditRetentionApplicationService,
  AuditSearchApplicationService,
  AuditSecurityApplicationService,
  AuditTimelineApplicationService,
} from 'shared/audit/application';
import {
  AuditConfigurationIntegrationOrchestrator,
  AuditEventBusIntegrationOrchestrator,
  AuditMonitoringIntegrationOrchestrator,
  AuditNotificationsIntegrationOrchestrator,
  AuditSynchronizationIntegrationOrchestrator,
  AuditWorkersIntegrationOrchestrator,
} from 'shared/audit/integration';
import {
  AuditAnalyticsController,
  AuditController,
  AuditExportsController,
  AuditForensicController,
  AuditHealthController,
  AuditMonitoringController,
  AuditReplayController,
  AuditRetentionController,
  AuditRetryController,
  AuditSecurityController,
  AuditSynchronizationController,
} from 'shared/audit/interfaces/http/controllers';
import type { AuditExecutable } from 'shared/audit/interfaces/http/controllers';
import { AuditRouteMiddlewareComposer } from 'shared/audit/interfaces/http/middlewares';
import type { AuditRouteMiddlewareSet, DependancesRoutesAudit } from 'shared/audit/interfaces/http/routes';
import {
  AuditAnomalyDetectionService,
  AuditHealthCheckService,
  AuditMetricsService,
  AuditObservabilityService,
  AuditQueueMonitoringService,
  AuditReplayRuntimeMonitoring,
  AuditRetryRuntimeMonitoring,
  AuditSynchronizationRuntimeMonitoring,
  AuditTenantMonitoringService,
  AuditTraceService,
  AuditVolumetryMonitoringService,
} from 'shared/audit/infrastructure/monitoring';
import { DeferredOfflineAuditSynchronizationService } from 'shared/audit/infrastructure/offline';
import { PostgresAuditProjectionRepository } from 'shared/audit/infrastructure/persistence/postgres/repositories';
import {
  PostgresAuditProjectionHandler,
  PostgresAuditProjectionProjector,
} from 'shared/audit/infrastructure/persistence/postgres/projections';
import { PostgresAuditEventBus } from 'shared/audit/infrastructure/event-bus';
import { AuditWorkerOrchestrator } from 'shared/audit/infrastructure/workers';
import { AuditConfigurationFacade } from 'shared/audit/infrastructure/configuration';
import { AuditSynchronizationOrchestrator } from 'shared/audit/infrastructure/synchronization';

class AuditExecutableAdapter<TInput, TOutput> implements AuditExecutable<TInput, TOutput> {
  public constructor(private readonly delegate: (input: TInput) => Promise<TOutput>) {}

  public async executer(input: TInput): Promise<TOutput> {
    return this.delegate(input);
  }
}

class AuditRuntimeFacade {
  public readonly configuration = new AuditConfigurationFacade();
  public readonly creation = new AuditCreationApplicationService();
  public readonly search = new AuditSearchApplicationService();
  public readonly timeline = new AuditTimelineApplicationService();
  public readonly forensic = new AuditForensicApplicationService();
  public readonly investigation = new AuditInvestigationApplicationService();
  public readonly exports = new AuditExportApplicationService();
  public readonly analytics = new AuditAnalyticsApplicationService();
  public readonly offline = new AuditOfflineApplicationService();
  public readonly replay = new AuditReplayApplicationService();
  public readonly retention = new AuditRetentionApplicationService();
  public readonly security = new AuditSecurityApplicationService();
  public readonly projections = new AuditProjectionApplicationService();

  public readonly monitoring = {
    health: new AuditHealthCheckService(),
    metrics: new AuditMetricsService(),
    traces: new AuditTraceService(),
    observability: new AuditObservabilityService(),
    queues: new AuditQueueMonitoringService(),
    replay: new AuditReplayRuntimeMonitoring(),
    retry: new AuditRetryRuntimeMonitoring(),
    synchronization: new AuditSynchronizationRuntimeMonitoring(),
    anomalies: new AuditAnomalyDetectionService(),
    volumetrie: new AuditVolumetryMonitoringService(),
    tenants: new AuditTenantMonitoringService(),
  };

  public readonly synchronization = {
    deferred: new DeferredOfflineAuditSynchronizationService(),
  };

  public readonly projectionHandler = new PostgresAuditProjectionHandler(
    new PostgresAuditProjectionProjector(new PostgresAuditProjectionRepository()),
  );

  public readonly eventBus = new PostgresAuditEventBus(this.projectionHandler);
  public readonly integrationEventBus = new AuditEventBusIntegrationOrchestrator(
    this.eventBus,
    this.creation,
  );
  public readonly workers = new AuditWorkerOrchestrator();
  public readonly workersIntegration = new AuditWorkersIntegrationOrchestrator(
    this.integrationEventBus.publisher,
    this.workers,
  );
  public readonly configurationIntegration = new AuditConfigurationIntegrationOrchestrator();
  public readonly monitoringIntegration = new AuditMonitoringIntegrationOrchestrator();
  public readonly notificationsIntegration = new AuditNotificationsIntegrationOrchestrator();
  public readonly synchronizationIntegration: AuditSynchronizationIntegrationOrchestrator;
  public readonly middlewares: AuditRouteMiddlewareSet;
  public readonly routesDependances: DependancesRoutesAudit;

  public constructor() {
    this.synchronizationIntegration = new AuditSynchronizationIntegrationOrchestrator(
      this.integrationEventBus.publisher,
      new AuditSynchronizationOrchestrator(this.projectionHandler),
    );
    this.middlewares = new AuditRouteMiddlewareComposer().composer();
    this.routesDependances = this.creerDependancesRoutes();
  }

  public async createEntry(payload: Parameters<AuditCreationApplicationService['creerAudit']>[0]) {
    return this.creation.creerAudit(payload);
  }

  public async searchEntries(payload: Parameters<AuditSearchApplicationService['rechercherAudits']>[0]) {
    return this.search.rechercherAudits(payload);
  }

  public async exportEntries(payload: Parameters<AuditExportApplicationService['exporterAudits']>[0]) {
    return this.exports.exporterAudits(payload);
  }

  public async investigate(payload: Parameters<AuditForensicApplicationService['lancerInvestigation']>[0]) {
    return this.forensic.lancerInvestigation(payload);
  }

  private creerDependancesRoutes(): DependancesRoutesAudit {
    return {
      auditController: new AuditController(
        new AuditExecutableAdapter(this.search.rechercherAudits.bind(this.search)),
        new AuditExecutableAdapter(this.search.consulterAudit.bind(this.search)),
        new AuditExecutableAdapter(this.timeline.obtenirTimelineAudit.bind(this.timeline)),
        new AuditExecutableAdapter(this.search.consulterHistoriqueActeur.bind(this.search)),
        new AuditExecutableAdapter(this.search.consulterHistoriqueRessource.bind(this.search)),
      ),
      auditForensicController: new AuditForensicController(
        new AuditExecutableAdapter(this.forensic.lancerInvestigation.bind(this.forensic)),
        new AuditExecutableAdapter(this.investigation.investiguerWorkflow.bind(this.investigation)),
        new AuditExecutableAdapter(this.security.investiguerIncidentSecurite.bind(this.security)),
        new AuditExecutableAdapter(this.forensic.detecterActionsSuspectes.bind(this.forensic)),
      ),
      auditExportsController: new AuditExportsController(
        new AuditExecutableAdapter(this.exports.exporterAudits.bind(this.exports)),
        new AuditExecutableAdapter(this.exports.exporterAuditForensic.bind(this.exports)),
        new AuditExecutableAdapter(this.exports.exporterAuditsAnalytics.bind(this.exports)),
        new AuditExecutableAdapter(this.exports.exporterAuditsSecurite.bind(this.exports)),
      ),
      auditReplayController: new AuditReplayController(
        new AuditExecutableAdapter(this.replay.rejouer.bind(this.replay)),
        this.projections.projeterAudit.bind(this.projections),
        this.projections.projeterAnalytics.bind(this.projections),
        async (payload) => this.investigation.investiguerWorkflow(payload as never),
      ),
      auditRetryController: new AuditRetryController(
        async (payload) => ({ accepte: true, type: 'JOB', payload }),
        async (payload) => ({ accepte: true, type: 'EXPORT', payload }),
        this.replay.retry.bind(this.replay),
      ),
      auditSynchronizationController: new AuditSynchronizationController(
        new AuditExecutableAdapter(this.offline.creerAuditOffline.bind(this.offline)),
        new AuditExecutableAdapter(this.offline.marquerAuditSynchronise.bind(this.offline)),
        new AuditExecutableAdapter(this.offline.rejouerAuditOffline.bind(this.offline)),
        new AuditExecutableAdapter(this.offline.resoudreConflitAudit.bind(this.offline)),
        this.offline.obtenirAuditsNonSynchronises.bind(this.offline),
      ),
      auditMonitoringController: new AuditMonitoringController(
        async () => this.monitoring.health.verifier(),
        async () => this.monitoring.metrics.collecter(),
        async () => this.monitoring.queues.obtenirSnapshot(),
        async () => this.monitoring.replay.obtenirSnapshot(),
        async () => this.monitoring.retry.obtenirSnapshot(),
        async () => this.monitoring.traces.lister(),
        async () => this.monitoring.anomalies.detecter(),
        async () => this.monitoring.volumetrie.obtenirSnapshot(),
        async () => this.monitoring.tenants.obtenirSnapshot(),
      ),
      auditAnalyticsController: new AuditAnalyticsController(
        new AuditExecutableAdapter(this.analytics.obtenirStatistiquesAudit.bind(this.analytics)),
        new AuditExecutableAdapter(this.analytics.obtenirStatistiquesExports.bind(this.analytics)),
        new AuditExecutableAdapter(this.analytics.obtenirStatistiquesSynchronisation.bind(this.analytics)),
        new AuditExecutableAdapter(this.analytics.obtenirStatistiquesSecurite.bind(this.analytics)),
        new AuditExecutableAdapter(this.analytics.obtenirVolumetrieAudit.bind(this.analytics)),
      ),
      auditRetentionController: new AuditRetentionController(
        new AuditExecutableAdapter(this.retention.preparerArchivageAudit.bind(this.retention)),
        new AuditExecutableAdapter(this.retention.archiverAudits.bind(this.retention)),
        new AuditExecutableAdapter(this.retention.consulterArchivesAudit.bind(this.retention)),
        async (payload) => ({ accepte: true, purge: true, payload }),
      ),
      auditSecurityController: new AuditSecurityController(
        new AuditExecutableAdapter(this.security.investiguerIncidentSecurite.bind(this.security)),
        new AuditExecutableAdapter(this.security.detecterEchecsSecuriteRepetees.bind(this.security)),
        new AuditExecutableAdapter(this.security.detecterExportMassif.bind(this.security)),
        async (payload) => ({ acces: 'RESTREINT', payload }),
      ),
      auditHealthController: new AuditHealthController(
        async () => this.monitoring.health.verifier(),
        async () => this.monitoring.queues.obtenirSnapshot(),
        async () => ({ projections: 'OK' }),
        async () => this.monitoring.synchronization.obtenirSnapshot(),
      ),
      middlewares: this.middlewares,
    };
  }
}

export type AuditRuntime = AuditRuntimeFacade;

export function creerAuditRuntime(): AuditRuntime {
  return new AuditRuntimeFacade();
}
