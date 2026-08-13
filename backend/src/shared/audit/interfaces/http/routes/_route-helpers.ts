import type { FastifyReply, FastifyRequest } from 'fastify';
import { createReadStream } from 'node:fs';
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

export async function executerTelechargementAudit(
  dependances: DependancesRoutesAudit,
  requete: FastifyRequest,
  reponse: FastifyReply,
  operation: () => Promise<{ nomFichier: string; mimeType: string; cheminPrive: string; tailleOctets: number }>,
): Promise<FastifyReply> {
  try {
    const fichier = await operation();
    const nomFichier = fichier.nomFichier.replaceAll(/[^a-zA-Z0-9._-]/g, '_');
    await dependances.middlewares?.apresSucces?.(requete, reponse, { export: nomFichier });
    return reponse
      .header('Content-Type', fichier.mimeType)
      .header('Content-Length', String(fichier.tailleOctets))
      .header('Content-Disposition', `attachment; filename="${nomFichier}"`)
      .header('Cache-Control', 'private, no-store')
      .header('X-Content-Type-Options', 'nosniff')
      .send(createReadStream(fichier.cheminPrive));
  } catch (erreur) {
    await dependances.middlewares?.apresErreur?.(requete, reponse, erreur);
    const normalisee = await dependances.middlewares?.gererErreur?.(erreur, requete, reponse);
    if (normalisee) return reponse.code(normalisee.statutHttp).send(normalisee.corps);
    return reponse.code(500).send({
      success: false,
      erreur: 'AUDIT_EXPORT_DOWNLOAD_ERROR',
      message: erreur instanceof Error ? erreur.message : "Le telechargement de l'export a echoue.",
      requestId: requete.context?.requestId,
      correlationId: requete.context?.correlationId,
    });
  }
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
