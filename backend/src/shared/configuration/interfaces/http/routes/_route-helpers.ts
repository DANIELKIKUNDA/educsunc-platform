import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ReponseControleurHttpConfiguration } from '../controllers';
import type { DependancesRoutesConfiguration } from './DependancesRoutesConfiguration';

// Ce fichier declare les helpers de route HTTP Configuration.

export async function appliquerPoliciesRouteConfiguration(
  dependances: DependancesRoutesConfiguration,
  requete: FastifyRequest,
  reponse: FastifyReply,
  policy: { permission?: string; scope?: string; familleAction?: 'READ' | 'WRITE' } = {},
): Promise<void> {
  const middlewares = dependances.middlewares;
  await middlewares?.onRequest?.(requete, reponse);
  await middlewares?.auth?.(requete, reponse);
  await middlewares?.tenant?.(requete, reponse);
  await middlewares?.observability?.(requete, reponse);
  await middlewares?.validation?.(requete, reponse);
  if (policy.permission) {
    await middlewares?.verifierPermission?.(policy.permission, requete, reponse);
  }
  if (policy.scope) {
    await middlewares?.verifierScope?.(policy.scope, requete, reponse);
  }
  if (policy.familleAction && !reponse.sent) {
    await middlewares?.verifierFamille?.(policy.familleAction, requete, reponse);
  }
}

export async function executerRouteConfiguration(
  dependances: DependancesRoutesConfiguration,
  requete: FastifyRequest,
  reponse: FastifyReply,
  action: () => Promise<ReponseControleurHttpConfiguration<unknown>>,
): Promise<void> {
  try {
    const resultat = await action();
    reponse.code(resultat.code).send(resultat);
  } catch (erreur) {
    const sortie = await dependances.middlewares?.gererErreur?.(erreur, requete, reponse);
    if (sortie) {
      reponse.code(sortie.statutHttp).send(sortie.corps);
      return;
    }
    throw erreur;
  }
}
