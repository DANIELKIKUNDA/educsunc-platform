import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesAudit } from './DependancesRoutesAudit';
import { appliquerPoliciesRouteAudit, executerRouteAudit } from './_route-helpers';
import { auditReplayOpenApi } from './AuditL5OpenApi';

export const creerReplayRoutes = (dependances: DependancesRoutesAudit): FastifyPluginAsync => async (serveur) => {
  serveur.post('/api/v1/replay/projections', { schema: auditReplayOpenApi }, (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.replay',
        admin: true,
        throttled: true,
        replay: true,
      });
      return dependances.auditReplayController.rejouerProjectionsAudit({
        body: requete.body as never,
        headers: requete.headers,
        context: requete.context,
      });
    }, 202));

  serveur.post('/api/v1/replay/analytics', { schema: auditReplayOpenApi }, (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.replay',
        admin: true,
        throttled: true,
        replay: true,
      });
      return dependances.auditReplayController.rejouerAnalyticsAudit({
        body: requete.body as never,
        headers: requete.headers,
        context: requete.context,
      });
    }, 202));

  serveur.post('/api/v1/replay/forensic', { schema: auditReplayOpenApi }, (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'forensic.replay',
        admin: true,
        throttled: true,
        replay: true,
        forensic: true,
      });
      return dependances.auditReplayController.rejouerForensicAudit({
        body: requete.body as never,
        headers: requete.headers,
        context: requete.context,
      });
    }, 202));
};
