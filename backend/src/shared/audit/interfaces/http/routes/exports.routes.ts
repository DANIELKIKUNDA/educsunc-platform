import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesAudit } from './DependancesRoutesAudit';
import { appliquerPoliciesRouteAudit, executerRouteAudit } from './_route-helpers';

export const creerExportsRoutes = (dependances: DependancesRoutesAudit): FastifyPluginAsync => async (serveur) => {
  serveur.post('/api/v1/exports/audit', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.export',
        scope: 'ECOLE',
        throttled: true,
        exports: true,
      });
      return dependances.auditExportsController.exporterAudit({
        body: requete.body as never,
        headers: requete.headers,
        context: requete.context,
        authorizedScope: 'ECOLE',
      });
    }, 202));

  serveur.post('/api/v1/exports/forensic', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'forensic.export',
        scope: 'ECOLE',
        throttled: true,
        exports: true,
        forensic: true,
      });
      return dependances.auditExportsController.exporterForensicAudit({
        body: requete.body as never,
        headers: requete.headers,
        context: requete.context,
        authorizedScope: 'ECOLE',
      });
    }, 202));

  serveur.post('/api/v1/exports/analytics', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.analytics.export',
        scope: 'ORGANISATION',
        throttled: true,
        exports: true,
        monitoring: true,
      });
      return dependances.auditExportsController.exporterAnalyticsAudit({
        body: requete.body as never,
        headers: requete.headers,
        context: requete.context,
        authorizedScope: 'ORGANISATION',
      });
    }, 202));

  serveur.get('/api/v1/exports/:id/status', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.export.read',
        scope: 'ECOLE',
        exports: true,
      });
      return dependances.auditExportsController.obtenirStatut({
        params: requete.params as never,
        headers: requete.headers,
        context: requete.context,
        authorizedScope: 'ECOLE',
      });
    }));

  serveur.get('/api/v1/exports/:id/download', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.export.download',
        scope: 'ECOLE',
        throttled: true,
        exports: true,
      });
      return dependances.auditExportsController.telecharger({
        params: requete.params as never,
        headers: requete.headers,
        context: requete.context,
        authorizedScope: 'ECOLE',
      });
    }));

  serveur.delete('/api/v1/exports/:id', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.export.delete',
        scope: 'ECOLE',
        admin: true,
        exports: true,
      });
      return {
        donnee: {
          exportId: (requete.params as { id?: string }).id,
          supprime: true,
        },
      };
    }));
};
