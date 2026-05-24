import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import type { AuditRouteMiddlewareSet } from '../../http/routes/DependancesRoutesAudit';
import type { AuditExportsInterfaceController } from '../controllers';

export interface DependancesAuditExportsInterfaceRoutes {
  readonly controller: AuditExportsInterfaceController;
  readonly middlewares?: AuditRouteMiddlewareSet;
}

async function appliquerMiddleware(
  middleware:
    | ((permission: string, requete: FastifyRequest, reponse: FastifyReply) => Promise<void> | void)
    | undefined,
  permission: string,
  requete: FastifyRequest,
  reponse: FastifyReply,
): Promise<void> {
  await middleware?.(permission, requete, reponse);
}

export const creerAuditExportsInterfaceRoutes = (
  dependances: DependancesAuditExportsInterfaceRoutes,
): FastifyPluginAsync => async (serveur) => {
  serveur.post('/api/v1/exports/audit', async (requete, reponse) => {
    await dependances.middlewares?.auth?.(requete, reponse);
    await dependances.middlewares?.tenant?.(requete, reponse);
    await appliquerMiddleware(dependances.middlewares?.verifierPermission, 'audit.export', requete, reponse);
    return dependances.controller.demanderExport({
      body: requete.body as never,
      headers: requete.headers,
      context: requete.context,
    });
  });

  serveur.post('/api/v1/exports/forensic', async (requete, reponse) => {
    await dependances.middlewares?.auth?.(requete, reponse);
    await dependances.middlewares?.forensic?.(requete, reponse);
    await appliquerMiddleware(dependances.middlewares?.verifierPermission, 'forensic.export', requete, reponse);
    return dependances.controller.demanderExport({
      body: { ...(requete.body as Record<string, unknown>), typeExport: 'FORENSIC' } as never,
      headers: requete.headers,
      context: requete.context,
    });
  });

  serveur.post('/api/v1/exports/analytics', async (requete, reponse) => {
    await dependances.middlewares?.auth?.(requete, reponse);
    await dependances.middlewares?.monitoring?.(requete, reponse);
    await appliquerMiddleware(
      dependances.middlewares?.verifierPermission,
      'audit.analytics.export',
      requete,
      reponse,
    );
    return dependances.controller.demanderExport({
      body: { ...(requete.body as Record<string, unknown>), typeExport: 'ANALYTICS' } as never,
      headers: requete.headers,
      context: requete.context,
    });
  });

  serveur.get('/api/v1/exports/:id/status', async (requete, _reponse) =>
    dependances.controller.suivreStatut({
      params: requete.params as never,
      headers: requete.headers,
      context: requete.context,
    }));

  serveur.get('/api/v1/exports/:id/download', async (requete, _reponse) =>
    dependances.controller.telecharger({
      params: requete.params as never,
      headers: requete.headers,
      context: requete.context,
    }));

  serveur.delete('/api/v1/exports/:id', async (requete, _reponse) =>
    dependances.controller.annuler({
      params: requete.params as never,
      body: requete.body as never,
      headers: requete.headers,
      context: requete.context,
    }));

  serveur.post('/api/v1/exports/:id/expire', async (requete, _reponse) =>
    dependances.controller.expirer({
      params: requete.params as never,
      body: requete.body as never,
      headers: requete.headers,
      context: requete.context,
    }));

  serveur.get('/api/v1/exports/:id/tracking', async (requete, _reponse) =>
    dependances.controller.tracking({
      params: requete.params as never,
      headers: requete.headers,
      context: requete.context,
    }));

  serveur.get('/api/v1/exports/monitoring/overview', async (requete, _reponse) =>
    dependances.controller.monitoring({
      headers: requete.headers,
      context: requete.context,
    }));

  serveur.post('/api/v1/exports/:id/recovery', async (requete, _reponse) =>
    dependances.controller.restaurer({
      params: requete.params as never,
      headers: requete.headers,
      context: requete.context,
    }));

  serveur.get('/api/v1/exports/:id/forensic', async (requete, _reponse) =>
    dependances.controller.statutForensic({
      params: requete.params as never,
      headers: requete.headers,
      context: requete.context,
    }));
};
