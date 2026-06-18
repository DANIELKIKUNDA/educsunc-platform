import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import type {
  ControleurAbonnementsRealtimeHttp,
  ControleurCanauxRealtimeHttp,
  ControleurConnexionsRealtimeHttp,
  ControleurDiagnosticsRealtimeHttp,
  ControleurRealtimeHttp,
} from '../controllers';

export interface JeuMiddlewaresRoutesRealtime {
  onRequest?(requete: FastifyRequest, reponse: FastifyReply): Promise<void> | void;
  auth?(requete: FastifyRequest, reponse: FastifyReply): Promise<void> | void;
  tenant?(requete: FastifyRequest, reponse: FastifyReply): Promise<void> | void;
  observability?(requete: FastifyRequest, reponse: FastifyReply): Promise<void> | void;
  validation?(requete: FastifyRequest, reponse: FastifyReply): Promise<void> | void;
  verifierPermission?(permission: string, requete: FastifyRequest, reponse: FastifyReply): Promise<void> | void;
  verifierScope?(scope: string, requete: FastifyRequest, reponse: FastifyReply): Promise<void> | void;
}

export interface DependancesRoutesRealtime {
  controleurRealtimeHttp: ControleurRealtimeHttp;
  controleurConnexionsRealtimeHttp: ControleurConnexionsRealtimeHttp;
  controleurAbonnementsRealtimeHttp: ControleurAbonnementsRealtimeHttp;
  controleurCanauxRealtimeHttp: ControleurCanauxRealtimeHttp;
  controleurDiagnosticsRealtimeHttp: ControleurDiagnosticsRealtimeHttp;
  middlewares?: JeuMiddlewaresRoutesRealtime;
}

export type FabriqueRoutesRealtime = (
  dependances: DependancesRoutesRealtime,
) => FastifyPluginAsync;
