import type { FastifyPluginAsync } from 'fastify';
import {
  ApplicationAlertMonitoringService,
  ApplicationAlertingEngineService,
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
  RepositoryAlerteMonitoringPostgres,
  RepositoryIncidentMonitoringPostgres,
  RepositoryMetriqueMonitoringPostgres,
  RepositoryTraceMonitoringPostgres,
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
import { obtenirPoolPostgresAuth } from '../../shared/auth/infrastructure';
import { ConfigurationRedisShared, FabriqueConnexionRedisShared } from '../../shared/infrastructure/redis';
import { CollecteurEtatDependancesMonitoring, CollecteurEtatRuntimeMonitoring } from '../../shared/monitoring/infrastructure/monitoring';

type PluginRoutesMonitoring = FastifyPluginAsync & {
  nom: string;
  prefixe: string;
};

function composerRoutesMonitoring(): {
  dependances: DependancesRoutesMonitoring;
  fermer: () => Promise<void>;
} {
  // Monitoring reutilise les infrastructures transverses : aucun second PostgreSQL/Redis/BullMQ.
  const poolPostgres = obtenirPoolPostgresAuth();
  const configurationRedis = ConfigurationRedisShared.lireDepuisEnvironnement();
  const redis = FabriqueConnexionRedisShared.obtenirClient(configurationRedis);
  const healthPort = new HealthcheckMonitoringInfrastructure(
    undefined,
    new CollecteurEtatDependancesMonitoring(poolPostgres, redis),
    new CollecteurEtatRuntimeMonitoring(configurationRedis),
  );
  const alertes = new RepositoryAlerteMonitoringPostgres(poolPostgres);
  const incidents = new RepositoryIncidentMonitoringPostgres(poolPostgres);
  const traces = new RepositoryTraceMonitoringPostgres(poolPostgres);
  const metriques = new RepositoryMetriqueMonitoringPostgres(poolPostgres);
  const signaux = new PublisherSignauxMonitoring();

  const healthService = new ApplicationHealthMonitoringService(healthPort);
  const alertService = new ApplicationAlertMonitoringService(alertes);
  const alertingEngine = new ApplicationAlertingEngineService(alertService);
  const incidentService = new ApplicationIncidentMonitoringService(incidents, traces);
  const observabilityService = new ApplicationObservabilityService(signaux, metriques, traces);

  const getSystemStateUseCase = new GetSystemStateUseCase(healthService);
  const collectHealthSnapshotUseCase = new CollectHealthSnapshotUseCase(healthService, alertingEngine);
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

  const dependances: DependancesRoutesMonitoring = {
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

  return {
    dependances,
    fermer: () => redis.deconnecter(),
  };
}

export const routeMonitoring: PluginRoutesMonitoring = Object.assign(
  async (serveur: Parameters<FastifyPluginAsync>[0]) => {
    const runtime = composerRoutesMonitoring();
    const { dependances } = runtime;

    serveur.addHook('onClose', runtime.fermer);

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
