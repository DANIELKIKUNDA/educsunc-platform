import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesAudit } from './DependancesRoutesAudit';
import { appliquerPoliciesRouteAudit, executerRouteAudit } from './_route-helpers';

export const creerForensicRoutes = (dependances: DependancesRoutesAudit): FastifyPluginAsync => async (serveur) => {
  serveur.get('/api/v1/forensic/correlation/:id', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'forensic.read',
        scope: 'ECOLE',
        throttled: true,
        forensic: true,
      });
      return dependances.auditForensicController.investiguerCorrelation({
        params: requete.params as never,
        query: requete.query as never,
        headers: requete.headers,
        context: requete.context,
      });
    }));

  serveur.get('/api/v1/forensic/session/:id', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'forensic.read',
        scope: 'ECOLE',
        throttled: true,
        forensic: true,
      });
      return dependances.auditForensicController.investiguerSession({
        params: requete.params as never,
        query: requete.query as never,
        headers: requete.headers,
        context: requete.context,
      });
    }));

  serveur.get('/api/v1/forensic/device/:id', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'forensic.read',
        scope: 'ECOLE',
        throttled: true,
        forensic: true,
      });
      return dependances.auditForensicController.investiguerDevice({
        params: requete.params as never,
        query: requete.query as never,
        headers: requete.headers,
        context: requete.context,
      });
    }));

  serveur.get('/api/v1/forensic/timeline/:id', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'forensic.timeline.read',
        scope: 'ECOLE',
        throttled: true,
        forensic: true,
      });
      return dependances.auditForensicController.investiguerTimeline({
        params: requete.params as never,
        query: requete.query as never,
        headers: requete.headers,
        context: requete.context,
      });
    }));

  serveur.get('/api/v1/forensic/incidents/:id', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'forensic.incidents',
        scope: 'ECOLE',
        throttled: true,
        forensic: true,
      });
      return dependances.auditForensicController.investiguerIncidentSecurite({
        params: requete.params as never,
        query: requete.query as never,
        headers: requete.headers,
        context: requete.context,
      });
    }));

  serveur.get('/api/v1/forensic/suspicions', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'forensic.security',
        scope: 'ECOLE',
        throttled: true,
        forensic: true,
        monitoring: true,
      });
      return dependances.auditForensicController.detecterSuspicions({
        query: requete.query as never,
        headers: requete.headers,
        context: requete.context,
      });
    }));
};
