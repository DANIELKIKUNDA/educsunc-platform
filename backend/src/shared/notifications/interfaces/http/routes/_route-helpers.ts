import type { FastifyReply, FastifyRequest } from 'fastify';
import type { DependancesRoutesNotifications } from './DependancesRoutesNotifications';

// Ce fichier centralise les helpers d'execution des routes HTTP Notifications.

/** Cette fonction applique les middlewares et controles de policy d'une route Notifications. */
export async function appliquerPoliciesRouteNotifications(
  dependances: DependancesRoutesNotifications,
  requete: FastifyRequest,
  reponse: FastifyReply,
  options: {
    readonly permission?: string;
    readonly scope?: string;
    readonly admin?: boolean;
    readonly replay?: boolean;
    readonly retry?: boolean;
    readonly monitoring?: boolean;
    readonly realtime?: boolean;
  } = {},
): Promise<void> {
  const middlewares = dependances.middlewares;
  await middlewares?.onRequest?.(requete, reponse);
  await middlewares?.auth?.(requete, reponse);
  await middlewares?.tenant?.(requete, reponse);
  await middlewares?.observability?.(requete, reponse);
  await middlewares?.validation?.(requete, reponse);

  if (options.permission) {
    await middlewares?.verifierPermission?.(options.permission, requete, reponse);
  }
  if (options.scope) {
    await middlewares?.verifierScope?.(options.scope, requete, reponse);
  }
  if (options.monitoring) {
    await middlewares?.monitoring?.(requete, reponse);
  }
  if (options.replay) {
    await middlewares?.replay?.(requete, reponse);
  }
  if (options.retry) {
    await middlewares?.retry?.(requete, reponse);
  }
  if (options.admin) {
    await middlewares?.admin?.(requete, reponse);
  }
  if (options.realtime) {
    await middlewares?.realtime?.(requete, reponse);
  }
}

/** Cette fonction execute une route Notifications et normalise sa reponse HTTP. */
export async function executerRouteNotifications(
  dependances: DependancesRoutesNotifications,
  requete: FastifyRequest,
  reponse: FastifyReply,
  executer: () => Promise<{ statutHttp: number; donnee: unknown; meta: unknown }>,
): Promise<void> {
  try {
    const resultat = await executer();
    reponse.code(resultat.statutHttp).send({
      succes: true,
      donnee: resultat.donnee,
      meta: resultat.meta,
    });
  } catch (erreur) {
    const resultatErreur = await dependances.middlewares?.gererErreur?.(erreur, requete, reponse);
    if (resultatErreur) {
      reponse.code(resultatErreur.statutHttp).send(resultatErreur.corps);
      return;
    }

    reponse.code(400).send({
      succes: false,
      erreur: erreur instanceof Error ? erreur.message : 'Erreur HTTP Notifications.',
    });
  }
}
