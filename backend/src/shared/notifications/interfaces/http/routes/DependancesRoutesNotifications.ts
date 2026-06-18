import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import type {
  ControleurNotificationsHttp,
  ControleurReplayNotificationHttp,
  ControleurRetryNotificationHttp,
  ControleurMonitoringNotificationsHttp,
  ControleurAdministrationNotificationsHttp,
  ControleurTempsReelNotificationFuturHttp,
} from '../controllers';

// Ce fichier declare les dependances et middlewares de routes HTTP Notifications.

/** Cette interface represente le jeu de middlewares optionnels des routes Notifications. */
export interface JeuMiddlewaresRoutesNotifications {
  onRequest?(requete: FastifyRequest, reponse: FastifyReply): Promise<void> | void;
  auth?(requete: FastifyRequest, reponse: FastifyReply): Promise<void> | void;
  tenant?(requete: FastifyRequest, reponse: FastifyReply): Promise<void> | void;
  observability?(requete: FastifyRequest, reponse: FastifyReply): Promise<void> | void;
  validation?(requete: FastifyRequest, reponse: FastifyReply): Promise<void> | void;
  monitoring?(requete: FastifyRequest, reponse: FastifyReply): Promise<void> | void;
  replay?(requete: FastifyRequest, reponse: FastifyReply): Promise<void> | void;
  retry?(requete: FastifyRequest, reponse: FastifyReply): Promise<void> | void;
  admin?(requete: FastifyRequest, reponse: FastifyReply): Promise<void> | void;
  realtime?(requete: FastifyRequest, reponse: FastifyReply): Promise<void> | void;
  verifierPermission?(permission: string, requete: FastifyRequest, reponse: FastifyReply): Promise<void> | void;
  verifierScope?(scope: string, requete: FastifyRequest, reponse: FastifyReply): Promise<void> | void;
  gererErreur?(
    erreur: unknown,
    requete: FastifyRequest,
    reponse: FastifyReply,
  ): Promise<{ statutHttp: number; corps: unknown } | void> | { statutHttp: number; corps: unknown } | void;
}

/** Cette interface represente les dependances runtime des routes Notifications. */
export interface DependancesRoutesNotifications {
  controleurNotificationsHttp: ControleurNotificationsHttp;
  controleurReplayNotificationHttp: ControleurReplayNotificationHttp;
  controleurRetryNotificationHttp: ControleurRetryNotificationHttp;
  controleurMonitoringNotificationsHttp: ControleurMonitoringNotificationsHttp;
  controleurAdministrationNotificationsHttp: ControleurAdministrationNotificationsHttp;
  controleurTempsReelNotificationFuturHttp: ControleurTempsReelNotificationFuturHttp;
  middlewares?: JeuMiddlewaresRoutesNotifications;
}

/** Cette signature represente une fabrique de plugin Fastify pour les routes Notifications. */
export type FabriqueRoutesNotifications = (
  dependances: DependancesRoutesNotifications,
) => FastifyPluginAsync;
