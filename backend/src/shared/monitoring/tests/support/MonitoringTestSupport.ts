import {
  ApplicationAlertMonitoringService,
  ApplicationHealthMonitoringService,
  ApplicationIncidentMonitoringService,
  ApplicationObservabilityService,
  CollectHealthSnapshotUseCase,
  CreateAlertUseCase,
  EscalateIncidentUseCase,
  GenerateDiagnosticUseCase,
  GetDashboardMonitoringUseCase,
  GetObservabilitySnapshotUseCase,
  GetSystemStateUseCase,
  HealthcheckMonitoringInfrastructure,
  PublisherSignauxMonitoring,
  RepositoryAlerteMonitoringMemoire,
  RepositoryIncidentMonitoringMemoire,
  RepositoryMetriqueMonitoringMemoire,
  RepositoryTraceMonitoringMemoire,
} from '../../../monitoring';

// Ce fichier declare le support d environnement des tests Monitoring.

export class MonitoringTestSupport {
  public static creerEnvironnement() {
    const healthPort = new HealthcheckMonitoringInfrastructure();
    const alertes = new RepositoryAlerteMonitoringMemoire();
    const incidents = new RepositoryIncidentMonitoringMemoire();
    const traces = new RepositoryTraceMonitoringMemoire();
    const metriques = new RepositoryMetriqueMonitoringMemoire();
    const signaux = new PublisherSignauxMonitoring();

    const healthService = new ApplicationHealthMonitoringService(healthPort);
    const alertService = new ApplicationAlertMonitoringService(alertes);
    const incidentService = new ApplicationIncidentMonitoringService(incidents, traces);
    const observabilityService = new ApplicationObservabilityService(signaux, metriques, traces);

    return {
      healthPort,
      alertes,
      incidents,
      traces,
      metriques,
      signaux,
      services: {
        health: healthService,
        alertes: alertService,
        incidents: incidentService,
        observability: observabilityService,
      },
      useCases: {
        getSystemState: new GetSystemStateUseCase(healthService),
        collectHealthSnapshot: new CollectHealthSnapshotUseCase(healthService),
        createAlert: new CreateAlertUseCase(alertService),
        escalateIncident: new EscalateIncidentUseCase(incidentService),
        generateDiagnostic: new GenerateDiagnosticUseCase(incidentService),
        getDashboard: new GetDashboardMonitoringUseCase(
          healthPort,
          alertes,
          incidents,
          metriques,
        ),
        getObservability: new GetObservabilitySnapshotUseCase(
          healthService,
          incidents,
          traces,
          metriques,
        ),
      },
    };
  }
}
