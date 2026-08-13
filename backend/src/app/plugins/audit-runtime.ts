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
  AuditCanonicalWriteService,
  AuditOutboxDeliveryService,
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
import {
  PostgresAuditCanonicalStorage,
  PostgresAuditEntryRepository,
  PostgresAuditReadRepository,
  PostgresAuditOutboxRepository,
  PostgresAuditProjectionRepository,
} from 'shared/audit/infrastructure/persistence/postgres/repositories';
import {
  PostgresAuditProjectionHandler,
  PostgresAuditProjectionProjector,
} from 'shared/audit/infrastructure/persistence/postgres/projections';
import { PostgresAuditEventBus } from 'shared/audit/infrastructure/event-bus';
import { AuditWorkerOrchestrator } from 'shared/audit/infrastructure/workers';
import { AuditReplayOperationsService } from 'shared/audit/infrastructure/replay';
import { AuditIntegrityOperationsService } from 'shared/audit/infrastructure/security';
import { CanonicalAuditProducer } from 'shared/audit/infrastructure/producers';
import {
  AuditExportFileGenerator,
  AuditExportOperationsService,
  AuditExportWorker,
  PrivateAuditExportFileStore,
  PostgresAuditExportJobStore,
} from 'shared/audit/infrastructure/exports';
import { AuditConfigurationFacade } from 'shared/audit/infrastructure/configuration';
import { AuditRetentionOperationsService } from 'shared/audit/infrastructure/retention';
import { AuditSynchronizationOrchestrator } from 'shared/audit/infrastructure/synchronization';
import {
  AuditCanonicalEventMapper,
  AuditOutboxEventPublisher,
  AuditOutboxWorker,
} from 'shared/audit/infrastructure/outbox';
import type { AuditOutboxObservation } from 'shared/audit/application/services/AuditOutboxDeliveryService';

export interface AuditRuntimeLogger {
  info(observation: AuditOutboxObservation): void;
  error(error: unknown): void;
}

class AuditExecutableAdapter<TInput, TOutput> implements AuditExecutable<TInput, TOutput> {
  public constructor(private readonly delegate: (input: TInput) => Promise<TOutput>) {}

  public async executer(input: TInput): Promise<TOutput> {
    return this.delegate(input);
  }
}

class AuditRuntimeFacade {
  public readonly configuration = new AuditConfigurationFacade();
  public readonly creation = new AuditCreationApplicationService();
  public readonly lectures = new PostgresAuditReadRepository();
  public readonly l5AuditProducer = new CanonicalAuditProducer();
  public readonly search = new AuditSearchApplicationService(this.lectures);
  public readonly timeline = new AuditTimelineApplicationService(this.lectures);
  public readonly forensic = new AuditForensicApplicationService(this.lectures);
  public readonly investigation = new AuditInvestigationApplicationService(this.lectures);
  public readonly exportJobs = new PostgresAuditExportJobStore();
  public readonly exportFiles = new PrivateAuditExportFileStore();
  public readonly exportGenerator = new AuditExportFileGenerator(this.lectures, this.exportFiles);
  public readonly exportWorker = new AuditExportWorker(
    this.exportJobs,
    this.exportGenerator,
    2_000,
    () => undefined,
    (job, resultat) => this.auditerOperationL5('EXPORT_GENERE', resultat, {
      exportId: job.idExport, demandeurId: job.requesterId, scope: job.scope,
      organisationId: job.organisationId, ecoleId: job.ecoleId, format: job.format,
    }),
  );
  public readonly exportOperations = new AuditExportOperationsService(
    this.exportJobs,
    this.exportFiles,
    () => this.exportWorker.reveiller(),
    (operation, payload) => this.auditerOperationL5(operation, 'SUCCESS', { ...payload }),
  );
  public readonly exports = new AuditExportApplicationService(this.exportOperations);
  public readonly analytics = new AuditAnalyticsApplicationService(this.lectures);
  public readonly offline = new AuditOfflineApplicationService();
  public readonly replay = new AuditReplayApplicationService();
  public readonly retentionOperations = new AuditRetentionOperationsService(
    this.lectures,
    undefined,
    (payload, resultat, idRun) => this.auditerOperationL5('ARCHIVAGE_AUDIT_EXECUTE', resultat, { ...payload, idRun }),
  );
  public readonly retention = new AuditRetentionApplicationService(this.retentionOperations);
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
  public readonly replayOperations = new AuditReplayOperationsService(
    this.lectures,
    new PostgresAuditEntryRepository(),
    this.projectionHandler,
    undefined,
    (payload, resultat) => this.auditerOperationL5('REPLAY_PROJECTION_EXECUTE', resultat, payload),
  );
  public readonly integrityOperations = new AuditIntegrityOperationsService(
    this.lectures,
    undefined,
    async (payload, anomalie) => {
      await this.auditerOperationL5('VERIFICATION_INTEGRITE_EXECUTEE', anomalie ? 'FAILED' : 'SUCCESS', payload);
      if (anomalie) await this.auditerOperationL5('ANOMALIE_INTEGRITE_DETECTEE', 'FAILED', payload);
    },
  );

  public readonly eventBus = new PostgresAuditEventBus(this.projectionHandler);
  public readonly canonicalWrite = new AuditCanonicalWriteService(
    new PostgresAuditCanonicalStorage(),
    new AuditCanonicalEventMapper(),
  );
  public readonly outboxRepository = new PostgresAuditOutboxRepository();
  public readonly outboxDelivery: AuditOutboxDeliveryService;
  public readonly outboxWorker: AuditOutboxWorker;
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

  public constructor(logger?: AuditRuntimeLogger) {
    this.outboxDelivery = new AuditOutboxDeliveryService(
      this.outboxRepository,
      new AuditOutboxEventPublisher(this.eventBus),
      (observation) => logger?.info(observation),
    );
    this.outboxWorker = new AuditOutboxWorker(
      this.outboxDelivery,
      2_000,
      (error) => logger?.error(error),
    );
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

  private async auditerOperationL5(
    action: 'EXPORT_GENERE' | 'EXPORT_DEMANDE' | 'EXPORT_TELECHARGE' | 'REPLAY_PROJECTION_EXECUTE' | 'ARCHIVAGE_AUDIT_EXECUTE' | 'VERIFICATION_INTEGRITE_EXECUTEE' | 'ANOMALIE_INTEGRITE_DETECTEE',
    resultat: 'SUCCESS' | 'FAILED' | 'IGNORED_DUPLICATE',
    payload: Record<string, unknown>,
  ): Promise<void> {
    const scope = payload.scope === 'PLATEFORME' || payload.scope === 'ORGANISATION' || payload.scope === 'ECOLE'
      ? payload.scope
      : 'PLATEFORME';
    const texte = (cle: string) => typeof payload[cle] === 'string' ? payload[cle] as string : undefined;
    await this.l5AuditProducer.produire({
      action,
      resultat,
      acteur: { id: texte('demandeurId') ?? texte('requesterId'), type: texte('demandeurId') || texte('requesterId') ? 'UTILISATEUR' : 'SYSTEME' },
      tenant: { scope, organisationId: texte('organisationId'), ecoleId: texte('ecoleId') },
      ressource: { type: 'AUDIT', id: texte('exportId') ?? texte('replayId') ?? texte('idRun') ?? texte('idAuditEntry'), libelle: action },
      contexte: { requestId: texte('requestId'), correlationId: texte('correlationId'), source: 'SYSTEM' },
      metadata: { operation: action, mode: payload.mode, format: payload.format },
      idempotencyKey: `L5:${action}:${texte('exportId') ?? texte('replayId') ?? texte('idRun') ?? texte('idAuditEntry') ?? texte('correlationId') ?? 'GLOBAL'}:${resultat}`,
    });
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
        (exportId, contexte) => this.exportOperations.obtenirStatut(exportId, {
          demandeurId: contexte.utilisateurId,
          scope: contexte.authorizedScope,
          organisationId: contexte.organisationId,
          ecoleId: contexte.ecoleId,
        }),
        (exportId, contexte) => this.exportOperations.preparerTelechargement(exportId, {
          demandeurId: contexte.utilisateurId,
          scope: contexte.authorizedScope,
          organisationId: contexte.organisationId,
          ecoleId: contexte.ecoleId,
        }),
        (exportId, contexte) => this.exportOperations.supprimer(exportId, {
          demandeurId: contexte.utilisateurId,
          scope: contexte.authorizedScope,
          organisationId: contexte.organisationId,
          ecoleId: contexte.ecoleId,
        }),
      ),
      auditReplayController: new AuditReplayController(
        new AuditExecutableAdapter(this.replay.rejouer.bind(this.replay)),
        this.replayOperations.executer.bind(this.replayOperations),
        this.replayOperations.executer.bind(this.replayOperations),
        this.replayOperations.executer.bind(this.replayOperations),
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
        this.retention.apercuPurge.bind(this.retention),
      ),
      auditSecurityController: new AuditSecurityController(
        new AuditExecutableAdapter(this.security.investiguerIncidentSecurite.bind(this.security)),
        new AuditExecutableAdapter(this.security.detecterEchecsSecuriteRepetees.bind(this.security)),
        new AuditExecutableAdapter(this.security.detecterExportMassif.bind(this.security)),
        async (payload) => ({ acces: 'RESTREINT', payload }),
        this.integrityOperations.verifierEntree.bind(this.integrityOperations),
        this.integrityOperations.verifierPlage.bind(this.integrityOperations),
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

export function creerAuditRuntime(logger?: AuditRuntimeLogger): AuditRuntime {
  return new AuditRuntimeFacade(logger);
}
