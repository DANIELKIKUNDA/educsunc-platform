import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesAudit } from './DependancesRoutesAudit';
import { appliquerPoliciesRouteAudit, executerRouteAudit, executerTelechargementAudit } from './_route-helpers';
import {
  auditExportCreateOpenApi,
  auditExportDeleteOpenApi,
  auditExportDownloadOpenApi,
  auditExportStatusOpenApi,
} from './AuditL5OpenApi';

export const creerExportsRoutes = (dependances: DependancesRoutesAudit): FastifyPluginAsync => async (serveur) => {
  serveur.post('/api/v1/exports/audit', { schema: auditExportCreateOpenApi }, (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.export',
        throttled: true,
        exports: true,
      });
      return dependances.auditExportsController.exporterAudit({
        body: requete.body as never,
        headers: requete.headers,
        context: requete.context,
      });
    }, 202));

  serveur.post('/api/v1/exports/forensic', { schema: auditExportCreateOpenApi }, (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'forensic.export',
        throttled: true,
        exports: true,
        forensic: true,
      });
      return dependances.auditExportsController.exporterForensicAudit({
        body: requete.body as never,
        headers: requete.headers,
        context: requete.context,
      });
    }, 202));

  serveur.post('/api/v1/exports/analytics', { schema: auditExportCreateOpenApi }, (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.analytics.export',
        throttled: true,
        exports: true,
        monitoring: true,
      });
      return dependances.auditExportsController.exporterAnalyticsAudit({
        body: requete.body as never,
        headers: requete.headers,
        context: requete.context,
      });
    }, 202));

  serveur.get('/api/v1/exports/:id/status', { schema: auditExportStatusOpenApi }, (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.export.read',
        exports: true,
      });
      return dependances.auditExportsController.obtenirStatut({
        params: requete.params as never,
        headers: requete.headers,
        context: requete.context,
      });
    }));

  serveur.get('/api/v1/exports/:id/download', { schema: auditExportDownloadOpenApi }, (requete, reponse) =>
    executerTelechargementAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.export.download',
        throttled: true,
        exports: true,
      });
      return dependances.auditExportsController.preparerFichier({
        params: requete.params as never,
        headers: requete.headers,
        context: requete.context,
      });
    }));

  serveur.delete('/api/v1/exports/:id', { schema: auditExportDeleteOpenApi }, (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.export.delete',
        admin: true,
        exports: true,
      });
      return dependances.auditExportsController.supprimer({
        params: requete.params as never,
        headers: requete.headers,
        context: requete.context,
      });
    }));
};
