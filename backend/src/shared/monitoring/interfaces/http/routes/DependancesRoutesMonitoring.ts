import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import type {
  ControleurAlertesMonitoringHttp,
  ControleurCapaciteMonitoringHttp,
  ControleurDiagnosticsMonitoringHttp,
  ControleurHealthMonitoringHttp,
  ControleurIncidentsMonitoringHttp,
  ControleurMonitoringHttp,
  ControleurTracesMonitoringHttp,
} from '../controllers';

// Ce fichier declare les dependances des routes HTTP Monitoring.

export interface JeuMiddlewaresRoutesMonitoring {
  onRequest?(requete: FastifyRequest, reponse: FastifyReply): Promise<void> | void;
  auth?(requete: FastifyRequest, reponse: FastifyReply): Promise<void> | void;
  tenant?(requete: FastifyRequest, reponse: FastifyReply): Promise<void> | void;
  observability?(requete: FastifyRequest, reponse: FastifyReply): Promise<void> | void;
  validation?(requete: FastifyRequest, reponse: FastifyReply): Promise<void> | void;
  verifierPermission?(permission: string, requete: FastifyRequest, reponse: FastifyReply): Promise<void> | void;
  verifierScope?(scope: string, requete: FastifyRequest, reponse: FastifyReply): Promise<void> | void;
}

export interface DependancesRoutesMonitoring {
  controleurMonitoringHttp: ControleurMonitoringHttp;
  controleurHealthMonitoringHttp: ControleurHealthMonitoringHttp;
  controleurAlertesMonitoringHttp: ControleurAlertesMonitoringHttp;
  controleurIncidentsMonitoringHttp: ControleurIncidentsMonitoringHttp;
  controleurTracesMonitoringHttp: ControleurTracesMonitoringHttp;
  controleurDiagnosticsMonitoringHttp: ControleurDiagnosticsMonitoringHttp;
  controleurCapaciteMonitoringHttp: ControleurCapaciteMonitoringHttp;
  middlewares?: JeuMiddlewaresRoutesMonitoring;
}

export type FabriqueRoutesMonitoring = (
  dependances: DependancesRoutesMonitoring,
) => FastifyPluginAsync;
