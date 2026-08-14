import {
  ApplicationAlertMonitoringService,
  ApplicationAlertingEngineService,
  ApplicationHealthMonitoringService,
  ApplicationIncidentMonitoringService,
  ApplicationObservabilityService,
  CollectHealthSnapshotUseCase,
  CalculateCapacityUseCase,
  CalculateSaturationUseCase,
  CaptureTraceUseCase,
  CreateAlertUseCase,
  EscalateIncidentUseCase,
  GenerateDiagnosticUseCase,
  GetDashboardMonitoringUseCase,
  GetObservabilitySnapshotUseCase,
  GetSystemStateUseCase,
  RegisterSignalUseCase,
  ResolveAlertUseCase,
} from '../../application';
import {
  FacadeInfrastructureMonitoring,
  HealthcheckMonitoringInfrastructure,
  CollecteurEtatDependancesMonitoring,
  CollecteurEtatRuntimeMonitoring,
  PublisherSignauxMonitoring,
  RepositoryAlerteMonitoringPostgres,
  RepositoryIncidentMonitoringPostgres,
  RepositoryMetriqueMonitoringPostgres,
  RepositoryTraceMonitoringPostgres,
} from '../../infrastructure';
import { obtenirPoolPostgresAuth } from '../../../auth/infrastructure';
import { ConfigurationRedisShared, FabriqueConnexionRedisShared } from '../../../infrastructure/redis';
import { RuntimeMonitoringCoordinator } from '../coordinators';
import { RuntimeMonitoringRegistry } from '../registry';
import {
  RuntimeAlertsMonitoring,
  RuntimeEscalationAlertsMonitoring,
  RuntimeSuppressionAlertsMonitoring,
} from '../alerts';
import {
  RuntimeCapacityMonitoring,
  RuntimePlanningCapacityMonitoring,
  RuntimeSaturationMonitoring,
} from '../capacity';
import {
  RuntimeDiagnosticsMonitoring,
  RuntimeForensicDiagnosticsMonitoring,
  RuntimeIncidentDiagnosticsMonitoring,
} from '../diagnostics';
import {
  RuntimeComponentHealthMonitoring,
  RuntimeDependencyHealthMonitoring,
  RuntimeHealthMonitoring,
} from '../health';
import {
  RuntimeDashboardMonitoring,
  RuntimeObservabilityMonitoring,
  RuntimeSignalsMonitoring,
} from '../observability';
import {
  RuntimeCorrelationTracingMonitoring,
  RuntimeSamplingTracingMonitoring,
  RuntimeTracingMonitoring,
} from '../tracing';

// Ce fichier declare la fabrique principale du runtime Monitoring.

export class FabriqueRuntimeMonitoring {
  public creer() {
    const facadeInfrastructure = new FacadeInfrastructureMonitoring();
    const registreInfrastructure = facadeInfrastructure.composants();
    const poolPostgres = obtenirPoolPostgresAuth();
    const configurationRedis = ConfigurationRedisShared.lireDepuisEnvironnement();
    const redis = FabriqueConnexionRedisShared.obtenirClient(configurationRedis);
    const healthPort = new HealthcheckMonitoringInfrastructure(
      undefined,
      new CollecteurEtatDependancesMonitoring(poolPostgres, redis),
      new CollecteurEtatRuntimeMonitoring(configurationRedis),
    );
    const alertRepository = new RepositoryAlerteMonitoringPostgres(poolPostgres);
    const incidentRepository = new RepositoryIncidentMonitoringPostgres(poolPostgres);
    const traceRepository = new RepositoryTraceMonitoringPostgres(poolPostgres);
    const metricRepository = new RepositoryMetriqueMonitoringPostgres(poolPostgres);
    const publisher = new PublisherSignauxMonitoring();

    const healthService = new ApplicationHealthMonitoringService(healthPort);
    const alertService = new ApplicationAlertMonitoringService(alertRepository);
    const alertingEngine = new ApplicationAlertingEngineService(alertService);
    const incidentService = new ApplicationIncidentMonitoringService(
      incidentRepository,
      traceRepository,
    );
    const observabilityService = new ApplicationObservabilityService(
      publisher,
      metricRepository,
      traceRepository,
    );

    const useCases = {
      getSystemState: new GetSystemStateUseCase(healthService),
      collectHealthSnapshot: new CollectHealthSnapshotUseCase(healthService, alertingEngine),
      createAlert: new CreateAlertUseCase(alertService),
      resolveAlert: new ResolveAlertUseCase(alertService),
      escalateIncident: new EscalateIncidentUseCase(incidentService),
      generateDiagnostic: new GenerateDiagnosticUseCase(incidentService),
      captureTrace: new CaptureTraceUseCase(observabilityService),
      registerSignal: new RegisterSignalUseCase(observabilityService),
      calculateCapacity: new CalculateCapacityUseCase(observabilityService),
      calculateSaturation: new CalculateSaturationUseCase(observabilityService),
      getDashboard: new GetDashboardMonitoringUseCase(
        healthPort,
        alertRepository,
        incidentRepository,
        metricRepository,
      ),
      getObservability: new GetObservabilitySnapshotUseCase(
        healthService,
        incidentRepository,
        traceRepository,
        metricRepository,
      ),
    };

    const registry = new RuntimeMonitoringRegistry({
      infrastructure: facadeInfrastructure,
    });
    const coordinator = new RuntimeMonitoringCoordinator(registry);

    return {
      infrastructure: registreInfrastructure,
      registry,
      coordinator,
      health: {
        global: new RuntimeHealthMonitoring(healthService),
        components: new RuntimeComponentHealthMonitoring(),
        dependencies: new RuntimeDependencyHealthMonitoring(),
      },
      diagnostics: {
        global: new RuntimeDiagnosticsMonitoring(),
        incidents: new RuntimeIncidentDiagnosticsMonitoring(useCases.generateDiagnostic),
        forensic: new RuntimeForensicDiagnosticsMonitoring(),
      },
      alerts: {
        global: new RuntimeAlertsMonitoring(useCases.createAlert, useCases.resolveAlert),
        escalation: new RuntimeEscalationAlertsMonitoring(useCases.escalateIncident),
        suppression: new RuntimeSuppressionAlertsMonitoring(),
      },
      capacity: {
        global: new RuntimeCapacityMonitoring(useCases.calculateCapacity),
        saturation: new RuntimeSaturationMonitoring(useCases.calculateSaturation),
        planning: new RuntimePlanningCapacityMonitoring(),
      },
      tracing: {
        global: new RuntimeTracingMonitoring(useCases.captureTrace),
        correlation: new RuntimeCorrelationTracingMonitoring(),
        sampling: new RuntimeSamplingTracingMonitoring(),
      },
      observability: {
        global: new RuntimeObservabilityMonitoring(useCases.getObservability),
        dashboard: new RuntimeDashboardMonitoring(useCases.getDashboard),
        signals: new RuntimeSignalsMonitoring(useCases.registerSignal),
      },
    };
  }
}
