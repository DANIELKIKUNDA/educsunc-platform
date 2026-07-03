import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesAudit } from './DependancesRoutesAudit';
import { appliquerPoliciesRouteAudit, executerRouteAudit } from './_route-helpers';

export const creerMonitoringRoutes = (dependances: DependancesRoutesAudit): FastifyPluginAsync => async (serveur) => {
  serveur.get('/api/v1/audit/monitoring/health', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.monitoring.read',
        scope: 'ORGANISATION',
        monitoring: true,
      });
      return dependances.auditMonitoringController.health({ headers: requete.headers, context: requete.context });
    }));

  serveur.get('/api/v1/audit/monitoring/metrics', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.monitoring.read',
        scope: 'ORGANISATION',
        monitoring: true,
      });
      return dependances.auditMonitoringController.metrics({ headers: requete.headers, context: requete.context });
    }));

  serveur.get('/api/v1/audit/monitoring/queues', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.monitoring.read',
        scope: 'ORGANISATION',
        monitoring: true,
      });
      return dependances.auditMonitoringController.queues({ headers: requete.headers, context: requete.context });
    }));

  serveur.get('/api/v1/audit/monitoring/replay', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.monitoring.read',
        scope: 'ORGANISATION',
        monitoring: true,
        replay: true,
      });
      return dependances.auditMonitoringController.replay({ headers: requete.headers, context: requete.context });
    }));

  serveur.get('/api/v1/audit/monitoring/retry', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.monitoring.read',
        scope: 'ORGANISATION',
        monitoring: true,
        retry: true,
      });
      return dependances.auditMonitoringController.retry({
        query: requete.query as never,
        headers: requete.headers,
        context: requete.context,
      });
    }));

  serveur.get('/api/v1/audit/monitoring/traces', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.monitoring.read',
        scope: 'ORGANISATION',
        monitoring: true,
      });
      return dependances.auditMonitoringController.traces({
        query: requete.query as never,
        headers: requete.headers,
        context: requete.context,
      });
    }));

  serveur.get('/api/v1/audit/monitoring/anomalies', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.monitoring.read',
        scope: 'ORGANISATION',
        monitoring: true,
      });
      return dependances.auditMonitoringController.anomalies({
        query: requete.query as never,
        headers: requete.headers,
        context: requete.context,
      });
    }));

  serveur.get('/api/v1/audit/monitoring/volumetrie', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.monitoring.read',
        scope: 'ORGANISATION',
        monitoring: true,
      });
      return dependances.auditMonitoringController.volumetrie({
        query: requete.query as never,
        headers: requete.headers,
        context: requete.context,
      });
    }));

  serveur.get('/api/v1/audit/monitoring/tenants', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.monitoring.read',
        scope: 'ORGANISATION',
        monitoring: true,
      });
      return dependances.auditMonitoringController.tenants({
        query: requete.query as never,
        headers: requete.headers,
        context: requete.context,
      });
    }));
};
