import type { FastifyReply, FastifyRequest } from 'fastify';
import type { DependancesRoutesRealtime } from './DependancesRoutesRealtime';

export const appliquerPoliciesRouteRealtime = async (
  dependances: DependancesRoutesRealtime,
  requete: FastifyRequest,
  reponse: FastifyReply,
  options: { readonly permission: string; readonly scope: string },
): Promise<void> => {
  await dependances.middlewares?.onRequest?.(requete, reponse);
  await dependances.middlewares?.auth?.(requete, reponse);
  await dependances.middlewares?.tenant?.(requete, reponse);
  await dependances.middlewares?.observability?.(requete, reponse);
  await dependances.middlewares?.validation?.(requete, reponse);
  await dependances.middlewares?.verifierPermission?.(options.permission, requete, reponse);
  await dependances.middlewares?.verifierScope?.(options.scope, requete, reponse);
};

export const executerRouteRealtime = async (
  dependances: DependancesRoutesRealtime,
  requete: FastifyRequest,
  reponse: FastifyReply,
  travail: () => Promise<{ readonly statutHttp: number; readonly corps: unknown; readonly meta?: unknown }>,
): Promise<void> => {
  const resultat = await travail();
  reponse.status(resultat.statutHttp).send(resultat.corps);
  void dependances;
  void requete;
};
