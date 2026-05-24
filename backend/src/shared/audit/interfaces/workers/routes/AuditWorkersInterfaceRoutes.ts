import type { FastifyPluginAsync } from 'fastify';
import type { AuditRouteMiddlewareSet } from '../../http/routes/DependancesRoutesAudit';
import type { AuditWorkersInterfaceController } from '../controllers';

export interface DependancesAuditWorkersInterfaceRoutes {
  readonly controller: AuditWorkersInterfaceController;
  readonly middlewares?: AuditRouteMiddlewareSet;
}

export const creerAuditWorkersInterfaceRoutes = (
  dependances: DependancesAuditWorkersInterfaceRoutes,
): FastifyPluginAsync => async (serveur) => {
  const proteger = async (requete: any, reponse: any) => {
    await dependances.middlewares?.auth?.(requete, reponse);
    await dependances.middlewares?.monitoring?.(requete, reponse);
    await dependances.middlewares?.security?.(requete, reponse);
  };

  serveur.get('/api/v1/workers/queues', async (requete, reponse) => { await proteger(requete, reponse); return dependances.controller.queues({ headers: requete.headers, context: requete.context }); });
  serveur.get('/api/v1/workers/runtime', async (requete, reponse) => { await proteger(requete, reponse); return dependances.controller.workers({ headers: requete.headers, context: requete.context }); });
  serveur.get('/api/v1/workers/schedulers', async (requete, reponse) => { await proteger(requete, reponse); return dependances.controller.schedulers({ headers: requete.headers, context: requete.context }); });
  serveur.get('/api/v1/workers/replay', async (requete, reponse) => { await proteger(requete, reponse); return dependances.controller.replay({ headers: requete.headers, context: requete.context }); });
  serveur.get('/api/v1/workers/retry', async (requete, reponse) => { await proteger(requete, reponse); return dependances.controller.retry({ headers: requete.headers, context: requete.context }); });
  serveur.get('/api/v1/workers/synchronization', async (requete, reponse) => { await proteger(requete, reponse); return dependances.controller.synchronization({ headers: requete.headers, context: requete.context }); });
  serveur.get('/api/v1/workers/exports', async (requete, reponse) => { await proteger(requete, reponse); return dependances.controller.exports({ headers: requete.headers, context: requete.context }); });
  serveur.get('/api/v1/workers/retention', async (requete, reponse) => { await proteger(requete, reponse); return dependances.controller.retention({ headers: requete.headers, context: requete.context }); });
  serveur.get('/api/v1/workers/analytics', async (requete, reponse) => { await proteger(requete, reponse); return dependances.controller.analytics({ headers: requete.headers, context: requete.context }); });
  serveur.get('/api/v1/workers/projections', async (requete, reponse) => { await proteger(requete, reponse); return dependances.controller.projections({ headers: requete.headers, context: requete.context }); });
  serveur.get('/api/v1/workers/dead-letter', async (requete, reponse) => { await proteger(requete, reponse); return dependances.controller.deadLetter({ headers: requete.headers, context: requete.context }); });
  serveur.get('/api/v1/workers/checkpoints', async (requete, reponse) => { await proteger(requete, reponse); return dependances.controller.checkpoints({ headers: requete.headers, context: requete.context }); });
  serveur.get('/api/v1/workers/orchestration', async (requete, reponse) => { await proteger(requete, reponse); return dependances.controller.orchestration({ headers: requete.headers, context: requete.context }); });
  serveur.get('/api/v1/workers/forensic', async (requete, reponse) => { await proteger(requete, reponse); return dependances.controller.forensic({ headers: requete.headers, context: requete.context }); });
  serveur.get('/api/v1/workers/monitoring', async (requete, reponse) => { await proteger(requete, reponse); return dependances.controller.monitoring({ headers: requete.headers, context: requete.context }); });
  serveur.get('/api/v1/workers/recovery', async (requete, reponse) => { await proteger(requete, reponse); return dependances.controller.recovery({ headers: requete.headers, context: requete.context }); });
  serveur.get('/api/v1/workers/security', async (requete, reponse) => { await proteger(requete, reponse); return dependances.controller.security({ headers: requete.headers, context: requete.context }); });
  serveur.get('/api/v1/workers/observability', async (requete, reponse) => { await proteger(requete, reponse); return dependances.controller.observability({ headers: requete.headers, context: requete.context }); });
  serveur.get('/api/v1/workers/batching', async (requete, reponse) => { await proteger(requete, reponse); return dependances.controller.batching({ headers: requete.headers, context: requete.context }); });
};

