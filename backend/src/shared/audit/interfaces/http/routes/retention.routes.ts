import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesAudit } from './DependancesRoutesAudit';
import { appliquerPoliciesRouteAudit, executerRouteAudit } from './_route-helpers';

export const creerRetentionRoutes = (dependances: DependancesRoutesAudit): FastifyPluginAsync => async (serveur) => {
  serveur.post('/api/v1/retention/archive', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.retention.archive',
        scope: 'ORGANISATION',
        admin: true,
        throttled: true,
        monitoring: true,
      });
      return dependances.auditRetentionController.archiver({
        body: requete.body as never,
        query: requete.query as never,
        headers: requete.headers,
        context: requete.context,
      });
    }, 202));

  serveur.post('/api/v1/retention/purge', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.retention.purge',
        scope: 'ORGANISATION',
        admin: true,
        throttled: true,
        monitoring: true,
      });
      return dependances.auditRetentionController.purge({
        body: requete.body as never,
        query: requete.query as never,
        headers: requete.headers,
        context: requete.context,
      });
    }, 202));

  serveur.get('/api/v1/retention/status', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.retention.read',
        scope: 'ORGANISATION',
        monitoring: true,
      });
      return dependances.auditRetentionController.statut({
        query: requete.query as never,
        headers: requete.headers,
        context: requete.context,
      });
    }));
};
