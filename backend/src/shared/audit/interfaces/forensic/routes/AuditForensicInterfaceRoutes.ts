import type { FastifyPluginAsync } from 'fastify';
import type { AuditRouteMiddlewareSet } from '../../http/routes/DependancesRoutesAudit';
import type { AuditForensicInterfaceController } from '../controllers';

export interface DependancesAuditForensicInterfaceRoutes {
  readonly controller: AuditForensicInterfaceController;
  readonly middlewares?: AuditRouteMiddlewareSet;
}

export const creerAuditForensicInterfaceRoutes = (
  dependances: DependancesAuditForensicInterfaceRoutes,
): FastifyPluginAsync => async (serveur) => {
  serveur.get('/api/v1/forensic/correlation/:id', async (requete, reponse) => {
    await dependances.middlewares?.auth?.(requete, reponse);
    await dependances.middlewares?.forensic?.(requete, reponse);
    return dependances.controller.correlation({
      params: requete.params as never,
      headers: requete.headers,
      context: requete.context,
    });
  });

  serveur.get('/api/v1/forensic/timeline/:id', async (requete, reponse) => {
    await dependances.middlewares?.auth?.(requete, reponse);
    await dependances.middlewares?.forensic?.(requete, reponse);
    return dependances.controller.timeline({
      params: requete.params as never,
      headers: requete.headers,
      context: requete.context,
    });
  });

  serveur.get('/api/v1/forensic/chronology/:id', async (requete, reponse) => {
    await dependances.middlewares?.auth?.(requete, reponse);
    await dependances.middlewares?.forensic?.(requete, reponse);
    return dependances.controller.chronology({
      params: requete.params as never,
      headers: requete.headers,
      context: requete.context,
    });
  });

  serveur.get('/api/v1/forensic/session/:id', async (requete, reponse) => {
    await dependances.middlewares?.auth?.(requete, reponse);
    await dependances.middlewares?.forensic?.(requete, reponse);
    return dependances.controller.session({
      params: requete.params as never,
      headers: requete.headers,
      context: requete.context,
    });
  });

  serveur.get('/api/v1/forensic/device/:id', async (requete, reponse) => {
    await dependances.middlewares?.auth?.(requete, reponse);
    await dependances.middlewares?.forensic?.(requete, reponse);
    return dependances.controller.device({
      params: requete.params as never,
      headers: requete.headers,
      context: requete.context,
    });
  });

  serveur.get('/api/v1/forensic/replay/:id', async (requete, reponse) => {
    await dependances.middlewares?.auth?.(requete, reponse);
    await dependances.middlewares?.forensic?.(requete, reponse);
    return dependances.controller.replay({
      params: requete.params as never,
      headers: requete.headers,
      context: requete.context,
    });
  });

  serveur.get('/api/v1/forensic/retry/:id', async (requete, reponse) => {
    await dependances.middlewares?.auth?.(requete, reponse);
    await dependances.middlewares?.forensic?.(requete, reponse);
    return dependances.controller.retry({
      params: requete.params as never,
      headers: requete.headers,
      context: requete.context,
    });
  });

  serveur.get('/api/v1/forensic/synchronization/:id', async (requete, reponse) => {
    await dependances.middlewares?.auth?.(requete, reponse);
    await dependances.middlewares?.forensic?.(requete, reponse);
    return dependances.controller.synchronization({
      params: requete.params as never,
      headers: requete.headers,
      context: requete.context,
    });
  });

  serveur.get('/api/v1/forensic/incidents/:id', async (requete, reponse) => {
    await dependances.middlewares?.auth?.(requete, reponse);
    await dependances.middlewares?.forensic?.(requete, reponse);
    return dependances.controller.incident({
      params: requete.params as never,
      headers: requete.headers,
      context: requete.context,
    });
  });

  serveur.get('/api/v1/forensic/suspicions', async (requete, reponse) => {
    await dependances.middlewares?.auth?.(requete, reponse);
    await dependances.middlewares?.forensic?.(requete, reponse);
    return dependances.controller.suspicions({
      query: requete.query as never,
      headers: requete.headers,
      context: requete.context,
    });
  });

  serveur.get('/api/v1/forensic/monitoring/overview', async (requete, reponse) => {
    await dependances.middlewares?.auth?.(requete, reponse);
    await dependances.middlewares?.monitoring?.(requete, reponse);
    return dependances.controller.monitoring({
      headers: requete.headers,
      context: requete.context,
    });
  });

  serveur.get('/api/v1/forensic/masking/:id', async (requete, reponse) => {
    await dependances.middlewares?.auth?.(requete, reponse);
    await dependances.middlewares?.forensic?.(requete, reponse);
    return dependances.controller.masking({
      params: requete.params as never,
      headers: requete.headers,
      context: requete.context,
    });
  });

  serveur.post('/api/v1/forensic/recovery/:id', async (requete, reponse) => {
    await dependances.middlewares?.auth?.(requete, reponse);
    await dependances.middlewares?.forensic?.(requete, reponse);
    return dependances.controller.recovery({
      params: requete.params as never,
      headers: requete.headers,
      context: requete.context,
    });
  });
};

