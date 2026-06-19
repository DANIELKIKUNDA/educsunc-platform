import type { FastifyPluginAsync } from 'fastify';
import {
  ApplicationAlertMonitoringService,
  ApplicationHealthMonitoringService,
  ApplicationIncidentMonitoringService,
  ApplicationObservabilityService,
  CalculateCapacityUseCase,
  CalculateSaturationUseCase,
  CaptureTraceUseCase,
  CollectHealthSnapshotUseCase,
  ControleurAlertesMonitoringHttp,
  ControleurCapaciteMonitoringHttp,
  ControleurDiagnosticsMonitoringHttp,
  ControleurHealthMonitoringHttp,
  ControleurIncidentsMonitoringHttp,
  ControleurMonitoringHttp,
  ControleurTracesMonitoringHttp,
  CreateAlertUseCase,
  EscalateIncidentUseCase,
  GenerateDiagnosticUseCase,
  GetAlertsUseCase,
  GetCapacityUseCase,
  GetDashboardMonitoringUseCase,
  GetDiagnosticsUseCase,
  GetIncidentsUseCase,
  GetObservabilitySnapshotUseCase,
  GetSystemStateUseCase,
  GetTracesUseCase,
  HealthcheckMonitoringInfrastructure,
  OpenIncidentUseCase,
  PublisherSignauxMonitoring,
  RepositoryAlerteMonitoringMemoire,
  RepositoryIncidentMonitoringMemoire,
  RepositoryMetriqueMonitoringMemoire,
  RepositoryTraceMonitoringMemoire,
  ResolveAlertUseCase,
  creerRoutesAlertesMonitoring,
  creerRoutesCapaciteMonitoring,
  creerRoutesDiagnosticsMonitoring,
  creerRoutesHealthMonitoring,
  creerRoutesIncidentsMonitoring,
  creerRoutesMonitoring,
  creerRoutesTracesMonitoring,
  type DependancesRoutesMonitoring,
} from '../../shared/monitoring';

type PluginRoutesMonitoring = FastifyPluginAsync & {
  nom: string;
  prefixe: string;
};

function composerRoutesMonitoring(): DependancesRoutesMonitoring {
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

  const getSystemStateUseCase = new GetSystemStateUseCase(healthService);
  const collectHealthSnapshotUseCase = new CollectHealthSnapshotUseCase(healthService);
  const createAlertUseCase = new CreateAlertUseCase(alertService);
  const resolveAlertUseCase = new ResolveAlertUseCase(alertService);
  const getAlertsUseCase = new GetAlertsUseCase(alertes);
  const openIncidentUseCase = new OpenIncidentUseCase(incidentService);
  const escalateIncidentUseCase = new EscalateIncidentUseCase(incidentService);
  const getIncidentsUseCase = new GetIncidentsUseCase(incidents);
  const generateDiagnosticUseCase = new GenerateDiagnosticUseCase(incidentService);
  const getDiagnosticsUseCase = new GetDiagnosticsUseCase(incidents);
  const calculateCapacityUseCase = new CalculateCapacityUseCase(observabilityService);
  const calculateSaturationUseCase = new CalculateSaturationUseCase(observabilityService);
  const getCapacityUseCase = new GetCapacityUseCase(metriques);
  const captureTraceUseCase = new CaptureTraceUseCase(observabilityService);
  const getTracesUseCase = new GetTracesUseCase(traces);
  const getDashboardUseCase = new GetDashboardMonitoringUseCase(
    healthPort,
    alertes,
    incidents,
    metriques,
  );
  const getObservabilitySnapshotUseCase = new GetObservabilitySnapshotUseCase(
    healthService,
    incidents,
    traces,
    metriques,
  );

  return {
    controleurMonitoringHttp: new ControleurMonitoringHttp(
      getSystemStateUseCase,
      getDashboardUseCase,
      getObservabilitySnapshotUseCase,
    ),
    controleurHealthMonitoringHttp: new ControleurHealthMonitoringHttp(
      getSystemStateUseCase,
      collectHealthSnapshotUseCase,
    ),
    controleurAlertesMonitoringHttp: new ControleurAlertesMonitoringHttp(
      createAlertUseCase,
      resolveAlertUseCase,
      getAlertsUseCase,
    ),
    controleurIncidentsMonitoringHttp: new ControleurIncidentsMonitoringHttp(
      openIncidentUseCase,
      escalateIncidentUseCase,
      getIncidentsUseCase,
    ),
    controleurTracesMonitoringHttp: new ControleurTracesMonitoringHttp(
      captureTraceUseCase,
      getTracesUseCase,
    ),
    controleurDiagnosticsMonitoringHttp: new ControleurDiagnosticsMonitoringHttp(
      generateDiagnosticUseCase,
      getDiagnosticsUseCase,
    ),
    controleurCapaciteMonitoringHttp: new ControleurCapaciteMonitoringHttp(
      calculateCapacityUseCase,
      calculateSaturationUseCase,
      getCapacityUseCase,
    ),
    middlewares: {
      auth: async (requete, reponse) => {
        if (!requete.context?.utilisateurId) {
          reponse.code(401).send({
            code: 'MONITORING_AUTH_REQUIRED',
            message: 'Authentification requise.',
          });
        }
      },
      verifierPermission: async (permission, requete, reponse) => {
        if (reponse.sent) {
          return;
        }

        const permissions = requete.context?.permissions ?? [];
        if (!permissions.includes(permission)) {
          reponse.code(403).send({
            code: 'MONITORING_PERMISSION_DENIED',
            message: `Permission requise: ${permission}`,
          });
        }
      },
      verifierScope: async (scope, requete, reponse) => {
        if (reponse.sent) {
          return;
        }

        if (scope !== 'SYSTEM') {
          return;
        }

        const scopes = requete.context?.scopes ?? [];
        const scopePlateforme = scopes.some((scopeAcces) =>
          scopeAcces.obtenirTypeScope().obtenirValeur() === 'PLATEFORME',
        );

        if (!scopePlateforme) {
          reponse.code(403).send({
            code: 'MONITORING_SCOPE_DENIED',
            message: 'Scope plateforme requis.',
          });
        }
      },
    },
  };
}

export const routeMonitoring: PluginRoutesMonitoring = Object.assign(
  async (serveur: Parameters<FastifyPluginAsync>[0]) => {
    const dependances = composerRoutesMonitoring();

    await serveur.register(creerRoutesMonitoring(dependances));
    await serveur.register(creerRoutesHealthMonitoring(dependances));
    await serveur.register(creerRoutesIncidentsMonitoring(dependances));
    await serveur.register(creerRoutesAlertesMonitoring(dependances));
    await serveur.register(creerRoutesDiagnosticsMonitoring(dependances));
    await serveur.register(creerRoutesCapaciteMonitoring(dependances));
    await serveur.register(creerRoutesTracesMonitoring(dependances));

    serveur.log.info(
      {
        contexte: {
          bc: 'shared-monitoring',
          prefixe: routeMonitoring.prefixe,
        },
      },
      'Routes Monitoring enregistrees.',
    );
  },
  {
    nom: 'monitoring',
    prefixe: '/api/v1',
  },
);
