import type { FastifyReply, FastifyRequest } from 'fastify';
import type { DependancesRoutesMonitoring } from './DependancesRoutesMonitoring';

// Ce fichier declare les helpers communs de routes Monitoring.
const ERREUR_ARRET_MONITORING = 'MONITORING_ROUTE_ABORTED';

function interrompreSiReponseEnvoyee(reponse: FastifyReply): void {
  if (reponse.sent) {
    throw new Error(ERREUR_ARRET_MONITORING);
  }
}

export const appliquerPoliciesRouteMonitoring = async (
  dependances: DependancesRoutesMonitoring,
  requete: FastifyRequest,
  reponse: FastifyReply,
  options: { readonly permission: string; readonly scope: string },
): Promise<void> => {
  await dependances.middlewares?.onRequest?.(requete, reponse);
  interrompreSiReponseEnvoyee(reponse);
  await dependances.middlewares?.auth?.(requete, reponse);
  interrompreSiReponseEnvoyee(reponse);
  await dependances.middlewares?.tenant?.(requete, reponse);
  interrompreSiReponseEnvoyee(reponse);
  await dependances.middlewares?.observability?.(requete, reponse);
  interrompreSiReponseEnvoyee(reponse);
  await dependances.middlewares?.validation?.(requete, reponse);
  interrompreSiReponseEnvoyee(reponse);
  await dependances.middlewares?.verifierPermission?.(options.permission, requete, reponse);
  interrompreSiReponseEnvoyee(reponse);
  await dependances.middlewares?.verifierScope?.(options.scope, requete, reponse);
  interrompreSiReponseEnvoyee(reponse);
};

export const executerRouteMonitoring = async (
  dependances: DependancesRoutesMonitoring,
  requete: FastifyRequest,
  reponse: FastifyReply,
  travail: () => Promise<{ readonly statutHttp: number; readonly corps: unknown } | { readonly statutHttp: number; readonly corps: unknown; readonly meta?: unknown }>,
): Promise<void> => {
  try {
    const resultat = await travail();
    if (!reponse.sent) {
      reponse.status(resultat.statutHttp).send(resultat.corps);
    }
  } catch (erreur) {
    if (reponse.sent) {
      return;
    }

    if (erreur instanceof Error && erreur.message === ERREUR_ARRET_MONITORING) {
      return;
    }

    if (erreur instanceof Error && erreur.name === 'MonitoringValidationException') {
      reponse.status(400).send({ code: 'MONITORING_VALIDATION_ERROR', message: erreur.message });
      return;
    }

    if (erreur instanceof Error && erreur.name === 'MonitoringNotFoundException') {
      reponse.status(404).send({ code: 'MONITORING_NOT_FOUND', message: erreur.message });
      return;
    }

    if (
      typeof erreur === 'object'
      && erreur !== null
      && 'statutHttp' in erreur
      && 'corps' in erreur
    ) {
      const erreurHttp = erreur as { statutHttp: number; corps: unknown };
      reponse.status(erreurHttp.statutHttp).send(erreurHttp.corps);
      return;
    }

    reponse.status(500).send({
      code: 'MONITORING_ROUTE_ERROR',
      message: 'Une erreur interne est survenue dans le module Monitoring.',
    });
  }

  void dependances;
  void requete;
};
