import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesAudit } from './DependancesRoutesAudit';
import { appliquerPoliciesRouteAudit, executerRouteAudit } from './_route-helpers';

export const creerSynchronizationRoutes = (dependances: DependancesRoutesAudit): FastifyPluginAsync => async (serveur) => {
  serveur.post('/api/v1/sync/audit', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.sync',
        scope: 'ECOLE',
        throttled: true,
        synchronization: true,
      });
      return dependances.auditSynchronizationController.synchroniserAudit({
        body: requete.body as never,
        headers: requete.headers,
        context: requete.context,
      });
    }, 202));

  serveur.post('/api/v1/sync/replay', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.sync.replay',
        scope: 'ECOLE',
        throttled: true,
        synchronization: true,
        replay: true,
      });
      return dependances.auditSynchronizationController.rejouerSynchronisation({
        body: requete.body as never,
        headers: requete.headers,
        context: requete.context,
      });
    }, 202));

  serveur.post('/api/v1/sync/recovery', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.sync.recovery',
        scope: 'ECOLE',
        throttled: true,
        synchronization: true,
      });
      return dependances.auditSynchronizationController.recupererSynchronisation({
        body: requete.body as never,
        headers: requete.headers,
        context: requete.context,
      });
    }, 202));

  serveur.post('/api/v1/sync/status', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.sync.status.write',
        scope: 'ECOLE',
        synchronization: true,
      });
      return dependances.auditSynchronizationController.marquerSynchronisation({
        body: requete.body as never,
        headers: requete.headers,
        context: requete.context,
      });
    }, 202));

  serveur.get('/api/v1/sync/status', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.sync.read',
        scope: 'ECOLE',
        synchronization: true,
      });
      return dependances.auditSynchronizationController.obtenirStatutSynchronisation({
        headers: requete.headers,
        context: requete.context,
      });
    }));
};
