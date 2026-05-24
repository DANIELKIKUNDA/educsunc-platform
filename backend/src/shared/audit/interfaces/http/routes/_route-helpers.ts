import type { FastifyReply, FastifyRequest } from 'fastify';
import type { DependancesRoutesAudit } from './DependancesRoutesAudit';

interface AuditRoutePolicies {
  readonly permission?: string;
  readonly scope?: string;
  readonly internal?: boolean;
  readonly admin?: boolean;
  readonly throttled?: boolean;
  readonly validation?: boolean;
  readonly forensic?: boolean;
  readonly replay?: boolean;
  readonly retry?: boolean;
  readonly synchronization?: boolean;
  readonly exports?: boolean;
  readonly monitoring?: boolean;
  readonly security?: boolean;
}

export async function appliquerPoliciesRouteAudit(
  dependances: DependancesRoutesAudit,
  requete: FastifyRequest,
  reponse: FastifyReply,
  policies: AuditRoutePolicies = {},
): Promise<void> {
  const middlewares = dependances.middlewares;
  await middlewares?.onRequest?.(requete, reponse);
  await middlewares?.requestId?.(requete, reponse);
  await middlewares?.correlation?.(requete, reponse);
  await middlewares?.observability?.(requete, reponse);
  await middlewares?.auth?.(requete, reponse);
  await middlewares?.tenant?.(requete, reponse);
  if (policies.security !== false) {
    await middlewares?.security?.(requete, reponse);
  }
  await middlewares?.device?.(requete, reponse);
  if (policies.permission) {
    await middlewares?.verifierPermission?.(policies.permission, requete, reponse);
  }
  if (policies.throttled) {
    await middlewares?.throttling?.(requete, reponse);
  }
  if (policies.scope) {
    await middlewares?.verifierScope?.(policies.scope, requete, reponse);
  }
  await middlewares?.auditContext?.(requete, reponse);
  if (policies.validation !== false) {
    await middlewares?.validation?.(requete, reponse);
  }
  if (policies.forensic) {
    await middlewares?.forensic?.(requete, reponse);
  }
  if (policies.replay) {
    await middlewares?.replay?.(requete, reponse);
  }
  if (policies.retry) {
    await middlewares?.retry?.(requete, reponse);
  }
  if (policies.synchronization) {
    await middlewares?.synchronization?.(requete, reponse);
  }
  if (policies.exports) {
    await middlewares?.exports?.(requete, reponse);
  }
  if (policies.monitoring !== false) {
    await middlewares?.monitoring?.(requete, reponse);
  }
  if (policies.internal) {
    await middlewares?.verifierInterne?.(requete, reponse);
  }
  if (policies.admin) {
    await middlewares?.verifierAdmin?.(requete, reponse);
  }
}

export async function executerRouteAudit(
  dependances: DependancesRoutesAudit,
  requete: FastifyRequest,
  reponse: FastifyReply,
  operation: () => Promise<unknown>,
  statutSucces = 200,
): Promise<FastifyReply> {
  try {
    const resultat = await operation();
    await dependances.middlewares?.apresSucces?.(requete, reponse, resultat);
    return reponse.code(statutSucces).send(resultat);
  } catch (erreur) {
    await dependances.middlewares?.apresErreur?.(requete, reponse, erreur);
    const erreurNormalisee = await dependances.middlewares?.gererErreur?.(erreur, requete, reponse);
    if (erreurNormalisee) {
      return reponse.code(erreurNormalisee.statutHttp).send(erreurNormalisee.corps);
    }

    const message =
      erreur instanceof Error ? erreur.message : 'Erreur Audit inconnue.';
    return reponse.code(500).send({
      success: false,
      erreur: 'AUDIT_ROUTE_ERROR',
      message,
      requestId: requete.context?.requestId,
      correlationId: requete.context?.correlationId,
    });
  }
}
