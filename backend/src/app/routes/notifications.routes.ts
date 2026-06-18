import type { FastifyPluginAsync } from 'fastify';
import {
  creerRoutesAdministrationNotifications,
  creerRoutesMonitoringNotifications,
  creerRoutesNotifications,
  creerRoutesReplayNotifications,
  creerRoutesRetryNotifications,
  creerRoutesTempsReelFuturNotifications,
} from '../../shared/notifications';
import { obtenirNotificationsRuntime } from '../plugins/notifications-runtime';

type PluginRoutesNotifications = FastifyPluginAsync & {
  nom: string;
  prefixe: string;
};

export const routeNotifications: PluginRoutesNotifications = Object.assign(
  async (serveur: Parameters<FastifyPluginAsync>[0]) => {
    const dependances = obtenirNotificationsRuntime().routesDependances;

    await serveur.register(creerRoutesNotifications(dependances));
    await serveur.register(creerRoutesRetryNotifications(dependances));
    await serveur.register(creerRoutesReplayNotifications(dependances));
    await serveur.register(creerRoutesMonitoringNotifications(dependances));
    await serveur.register(creerRoutesAdministrationNotifications(dependances));
    await serveur.register(creerRoutesTempsReelFuturNotifications(dependances));

    serveur.log.info(
      {
        contexte: {
          bc: 'shared-notifications',
          prefixe: routeNotifications.prefixe,
        },
      },
      'Routes Notifications enregistrees.',
    );
  },
  {
    nom: 'notifications',
    prefixe: '/api/v1',
  },
);
