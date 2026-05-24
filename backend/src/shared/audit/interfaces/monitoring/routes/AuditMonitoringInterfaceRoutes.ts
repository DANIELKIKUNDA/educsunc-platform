import type { FastifyPluginAsync } from 'fastify';
import type { AuditRouteMiddlewareSet } from '../../http/routes/DependancesRoutesAudit';
import type { AuditMonitoringInterfaceController } from '../controllers';

export interface DependancesAuditMonitoringInterfaceRoutes {
  readonly controller: AuditMonitoringInterfaceController;
  readonly middlewares?: AuditRouteMiddlewareSet;
}

export const creerAuditMonitoringInterfaceRoutes = (
  dependances: DependancesAuditMonitoringInterfaceRoutes,
): FastifyPluginAsync => async (serveur) => {
  const proteger = async (requete: any, reponse: any) => {
    await dependances.middlewares?.auth?.(requete, reponse);
    await dependances.middlewares?.monitoring?.(requete, reponse);
  };

  serveur.get('/api/v1/monitoring/health', async (requete, reponse) => {
    await proteger(requete, reponse);
    return dependances.controller.health({ headers: requete.headers, context: requete.context });
  });
  serveur.get('/api/v1/monitoring/metrics', async (requete, reponse) => {
    await proteger(requete, reponse);
    return dependances.controller.metrics({ query: requete.query as never, headers: requete.headers, context: requete.context });
  });
  serveur.get('/api/v1/monitoring/traces', async (requete, reponse) => {
    await proteger(requete, reponse);
    return dependances.controller.traces({ query: requete.query as never, headers: requete.headers, context: requete.context });
  });
  serveur.get('/api/v1/monitoring/queues', async (requete, reponse) => {
    await proteger(requete, reponse);
    return dependances.controller.queues({ query: requete.query as never, headers: requete.headers, context: requete.context });
  });
  serveur.get('/api/v1/monitoring/workers', async (requete, reponse) => {
    await proteger(requete, reponse);
    return dependances.controller.workers({ query: requete.query as never, headers: requete.headers, context: requete.context });
  });
  serveur.get('/api/v1/monitoring/replay', async (requete, reponse) => {
    await proteger(requete, reponse);
    return dependances.controller.replay({ query: requete.query as never, headers: requete.headers, context: requete.context });
  });
  serveur.get('/api/v1/monitoring/retry', async (requete, reponse) => {
    await proteger(requete, reponse);
    return dependances.controller.retry({ query: requete.query as never, headers: requete.headers, context: requete.context });
  });
  serveur.get('/api/v1/monitoring/synchronization', async (requete, reponse) => {
    await proteger(requete, reponse);
    return dependances.controller.synchronization({ query: requete.query as never, headers: requete.headers, context: requete.context });
  });
  serveur.get('/api/v1/monitoring/exports', async (requete, reponse) => {
    await proteger(requete, reponse);
    return dependances.controller.exports({ query: requete.query as never, headers: requete.headers, context: requete.context });
  });
  serveur.get('/api/v1/monitoring/projections', async (requete, reponse) => {
    await proteger(requete, reponse);
    return dependances.controller.projections({ query: requete.query as never, headers: requete.headers, context: requete.context });
  });
  serveur.get('/api/v1/monitoring/anomalies', async (requete, reponse) => {
    await proteger(requete, reponse);
    return dependances.controller.anomalies({ query: requete.query as never, headers: requete.headers, context: requete.context });
  });
  serveur.get('/api/v1/monitoring/alerts', async (requete, reponse) => {
    await proteger(requete, reponse);
    return dependances.controller.alerts({ query: requete.query as never, headers: requete.headers, context: requete.context });
  });
  serveur.get('/api/v1/monitoring/tenants', async (requete, reponse) => {
    await proteger(requete, reponse);
    return dependances.controller.tenants({ query: requete.query as never, headers: requete.headers, context: requete.context });
  });
  serveur.get('/api/v1/monitoring/volumetrie', async (requete, reponse) => {
    await proteger(requete, reponse);
    return dependances.controller.volumetrie({ query: requete.query as never, headers: requete.headers, context: requete.context });
  });
  serveur.get('/api/v1/monitoring/observability', async (requete, reponse) => {
    await proteger(requete, reponse);
    return dependances.controller.observability({ query: requete.query as never, headers: requete.headers, context: requete.context });
  });
  serveur.post('/api/v1/monitoring/recovery', async (requete, reponse) => {
    await proteger(requete, reponse);
    return dependances.controller.recovery({ headers: requete.headers, context: requete.context });
  });
};

