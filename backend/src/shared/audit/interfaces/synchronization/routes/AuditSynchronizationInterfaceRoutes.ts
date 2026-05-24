import type { FastifyPluginAsync } from 'fastify';
import type { AuditRouteMiddlewareSet } from '../../http/routes/DependancesRoutesAudit';
import type { AuditSynchronizationInterfaceController } from '../controllers';

export interface DependancesAuditSynchronizationInterfaceRoutes {
  readonly controller: AuditSynchronizationInterfaceController;
  readonly middlewares?: AuditRouteMiddlewareSet;
}

export const creerAuditSynchronizationInterfaceRoutes = (
  dependances: DependancesAuditSynchronizationInterfaceRoutes,
): FastifyPluginAsync => async (serveur) => {
  const proteger = async (requete: any, reponse: any) => {
    await dependances.middlewares?.auth?.(requete, reponse);
    await dependances.middlewares?.tenant?.(requete, reponse);
    await dependances.middlewares?.synchronization?.(requete, reponse);
  };

  serveur.post('/api/v1/synchronization/audit', async (requete, reponse) => {
    await proteger(requete, reponse);
    return dependances.controller.synchroniser({ body: requete.body as never, headers: requete.headers, context: requete.context });
  });
  serveur.post('/api/v1/synchronization/replay', async (requete, reponse) => {
    await proteger(requete, reponse);
    return dependances.controller.replay({ body: requete.body as never, headers: requete.headers, context: requete.context });
  });
  serveur.post('/api/v1/synchronization/retry', async (requete, reponse) => {
    await proteger(requete, reponse);
    return dependances.controller.retry({ body: requete.body as never, headers: requete.headers, context: requete.context });
  });
  serveur.get('/api/v1/synchronization/chronology', async (requete, reponse) => {
    await proteger(requete, reponse);
    return dependances.controller.chronology({ headers: requete.headers, context: requete.context });
  });
  serveur.post('/api/v1/synchronization/conflicts', async (requete, reponse) => {
    await proteger(requete, reponse);
    return dependances.controller.conflicts({ body: requete.body as never, headers: requete.headers, context: requete.context });
  });
  serveur.get('/api/v1/synchronization/devices', async (requete, reponse) => {
    await proteger(requete, reponse);
    return dependances.controller.devices({ headers: requete.headers, context: requete.context });
  });
  serveur.post('/api/v1/synchronization/recovery', async (requete, reponse) => {
    await proteger(requete, reponse);
    return dependances.controller.recovery({ body: requete.body as never, headers: requete.headers, context: requete.context });
  });
  serveur.get('/api/v1/synchronization/queues', async (requete, reponse) => {
    await proteger(requete, reponse);
    return dependances.controller.queues({ headers: requete.headers, context: requete.context });
  });
  serveur.get('/api/v1/synchronization/workers', async (requete, reponse) => {
    await proteger(requete, reponse);
    return dependances.controller.workers({ headers: requete.headers, context: requete.context });
  });
  serveur.get('/api/v1/synchronization/orchestration', async (requete, reponse) => {
    await proteger(requete, reponse);
    return dependances.controller.orchestration({ headers: requete.headers, context: requete.context });
  });
  serveur.get('/api/v1/synchronization/monitoring', async (requete, reponse) => {
    await proteger(requete, reponse);
    return dependances.controller.monitoring({ headers: requete.headers, context: requete.context });
  });
  serveur.get('/api/v1/synchronization/forensic', async (requete, reponse) => {
    await proteger(requete, reponse);
    return dependances.controller.forensic({ headers: requete.headers, context: requete.context });
  });
  serveur.get('/api/v1/synchronization/analytics', async (requete, reponse) => {
    await proteger(requete, reponse);
    return dependances.controller.analytics({ headers: requete.headers, context: requete.context });
  });
  serveur.get('/api/v1/synchronization/batching', async (requete, reponse) => {
    await proteger(requete, reponse);
    return dependances.controller.batching({ headers: requete.headers, context: requete.context });
  });
  serveur.get('/api/v1/synchronization/incremental', async (requete, reponse) => {
    await proteger(requete, reponse);
    return dependances.controller.incremental({ headers: requete.headers, context: requete.context });
  });
  serveur.get('/api/v1/synchronization/checkpoints', async (requete, reponse) => {
    await proteger(requete, reponse);
    return dependances.controller.checkpoints({ headers: requete.headers, context: requete.context });
  });
};

