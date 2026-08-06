import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesAudit } from './DependancesRoutesAudit';
import { appliquerPoliciesRouteAudit, executerRouteAudit } from './_route-helpers';

export const creerAuditRoutes = (dependances: DependancesRoutesAudit): FastifyPluginAsync => async (serveur) => {
  serveur.get('/api/v1/audit', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.read',
        scope: 'PLATEFORME',
      });
      return dependances.auditController.lister({
        query: requete.query as never,
        headers: requete.headers,
        context: requete.context,
        authorizedScope: 'PLATEFORME',
      });
    }));

  serveur.get('/api/v1/audit/:id', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.read',
        scope: 'PLATEFORME',
      });
      return dependances.auditController.consulterParId({
        params: requete.params as never,
        query: requete.query as never,
        headers: requete.headers,
        context: requete.context,
        authorizedScope: 'PLATEFORME',
      });
    }));

  serveur.get('/api/v1/audit/timeline', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.timeline.read',
        scope: 'PLATEFORME',
      });
      return dependances.auditController.obtenirTimeline({
        query: requete.query as never,
        headers: requete.headers,
        context: requete.context,
        authorizedScope: 'PLATEFORME',
      });
    }));

  serveur.get('/api/v1/audit/history', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.history.read',
        scope: 'PLATEFORME',
      });
      return dependances.auditController.obtenirHistorique({
        query: requete.query as never,
        headers: requete.headers,
        context: requete.context,
        authorizedScope: 'PLATEFORME',
      });
    }));
};
