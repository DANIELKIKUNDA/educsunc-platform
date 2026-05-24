import { randomUUID } from 'node:crypto';
import type { FastifyRequest } from 'fastify';
import {
  REQUEST_CONTEXT_HEADER_CORRELATION,
  REQUEST_CONTEXT_HEADER_DEVICE,
  REQUEST_CONTEXT_HEADER_ORGANISATION,
  REQUEST_CONTEXT_HEADER_REQUEST,
  REQUEST_CONTEXT_HEADER_TENANT,
  RequestContextFactory,
} from 'shared/context';
import type { RequestContext } from 'shared/context';
import { ValidationError } from 'shared/exceptions/ValidationError';
import type { AuditMonitoringSnapshot } from './AuditMiddlewareTypes';

interface AuditRuntimeInterne {
  startedAt?: number;
  requestSize?: number;
  monitoring?: AuditMonitoringSnapshot;
}

const runtimeStore = new WeakMap<FastifyRequest, AuditRuntimeInterne>();

export function lireHeaderTexte(
  requete: FastifyRequest | { headers: Record<string, unknown> },
  nom: string,
): string | undefined {
  const valeur = requete.headers[nom];
  if (typeof valeur === 'string') {
    const propre = valeur.trim();
    return propre === '' ? undefined : propre;
  }

  if (Array.isArray(valeur) && typeof valeur[0] === 'string') {
    const propre = valeur[0].trim();
    return propre === '' ? undefined : propre;
  }

  return undefined;
}

export function ecrireHeaderTexte(requete: FastifyRequest, nom: string, valeur?: string): void {
  if (!valeur || valeur.trim() === '') {
    return;
  }

  requete.headers[nom] = valeur.trim();
}

export function obtenirContexte(requete: FastifyRequest): RequestContext {
  if (requete.context) {
    return requete.context;
  }

  const contexte = RequestContextFactory.creerContexteInitial({
    requestId: String(requete.id),
    correlationId: lireHeaderTexte(requete, REQUEST_CONTEXT_HEADER_CORRELATION),
    adresseIp: requete.ip,
    userAgent: lireHeaderTexte(requete, 'user-agent'),
    deviceId:
      lireHeaderTexte(requete, REQUEST_CONTEXT_HEADER_DEVICE)
      ?? lireHeaderTexte(requete, 'x-device-id'),
    appVersion: lireHeaderTexte(requete, 'x-app-version'),
    plateforme: lireHeaderTexte(requete, 'x-platform'),
    syncId: lireHeaderTexte(requete, 'x-sync-id'),
    modeOffline: lireHeaderTexte(requete, 'x-offline-mode') === 'true',
  });
  requete.context = contexte;
  return contexte;
}

export function assurerRequestId(requete: FastifyRequest): string {
  const contexte = obtenirContexte(requete);
  const requestId =
    contexte.requestId?.trim()
    || lireHeaderTexte(requete, REQUEST_CONTEXT_HEADER_REQUEST)
    || String(requete.id)
    || randomUUID();

  requete.context = {
    ...contexte,
    requestId,
  };
  ecrireHeaderTexte(requete, REQUEST_CONTEXT_HEADER_REQUEST, requestId);
  return requestId;
}

export function assurerCorrelationId(requete: FastifyRequest): string {
  const contexte = obtenirContexte(requete);
  const correlationId =
    contexte.correlationId?.trim()
    || lireHeaderTexte(requete, REQUEST_CONTEXT_HEADER_CORRELATION)
    || contexte.requestId
    || String(requete.id)
    || randomUUID();

  requete.context = {
    ...contexte,
    correlationId,
  };
  ecrireHeaderTexte(requete, REQUEST_CONTEXT_HEADER_CORRELATION, correlationId);
  return correlationId;
}

export function propagerHeadersContexte(requete: FastifyRequest): void {
  const contexte = obtenirContexte(requete);
  ecrireHeaderTexte(requete, REQUEST_CONTEXT_HEADER_REQUEST, contexte.requestId);
  ecrireHeaderTexte(requete, REQUEST_CONTEXT_HEADER_CORRELATION, contexte.correlationId);
  ecrireHeaderTexte(
    requete,
    REQUEST_CONTEXT_HEADER_ORGANISATION,
    contexte.organisationActiveId,
  );
  ecrireHeaderTexte(requete, REQUEST_CONTEXT_HEADER_TENANT, contexte.ecoleActiveId);
  ecrireHeaderTexte(
    requete,
    REQUEST_CONTEXT_HEADER_DEVICE,
    contexte.deviceId,
  );
}

export function calculerTaillePayload(payload: unknown): number {
  if (payload == null) {
    return 0;
  }

  if (typeof payload === 'string') {
    return Buffer.byteLength(payload, 'utf8');
  }

  try {
    return Buffer.byteLength(JSON.stringify(payload), 'utf8');
  } catch {
    return 0;
  }
}

export function obtenirRuntimeInterne(requete: FastifyRequest): AuditRuntimeInterne {
  const existant = runtimeStore.get(requete);
  if (existant) {
    return existant;
  }

  const cree: AuditRuntimeInterne = {};
  runtimeStore.set(requete, cree);
  return cree;
}

export function memoriserMonitoring(
  requete: FastifyRequest,
  monitoring: AuditMonitoringSnapshot,
): void {
  obtenirRuntimeInterne(requete).monitoring = monitoring;
}

export function lireMonitoring(requete: FastifyRequest): AuditMonitoringSnapshot | undefined {
  return obtenirRuntimeInterne(requete).monitoring;
}

export function memoriserDebutTraitement(requete: FastifyRequest): number {
  const maintenant = Date.now();
  obtenirRuntimeInterne(requete).startedAt = maintenant;
  return maintenant;
}

export function lireDebutTraitement(requete: FastifyRequest): number | undefined {
  return obtenirRuntimeInterne(requete).startedAt;
}

export function memoriserTaillePayload(requete: FastifyRequest, taille: number): void {
  obtenirRuntimeInterne(requete).requestSize = taille;
}

export function lireTaillePayload(requete: FastifyRequest): number {
  return obtenirRuntimeInterne(requete).requestSize ?? 0;
}

export function exigerUtilisateurAuthentifie(requete: FastifyRequest): string {
  const utilisateurId = obtenirContexte(requete).utilisateurId?.trim();
  if (!utilisateurId) {
    throw new ValidationError("L'utilisateur authentifie est obligatoire.", 'AUDIT_AUTH_REQUIRED');
  }

  return utilisateurId;
}

export function exigerPermissionContexte(
  requete: FastifyRequest,
  permissionDemandee: string,
): void {
  const permissions = obtenirContexte(requete).permissions;
  if (!permissions.includes(permissionDemandee)) {
    throw new ValidationError(
      `La permission ${permissionDemandee} est requise.`,
      'AUDIT_PERMISSION_REQUIRED',
    );
  }
}

export function exigerScopeContexte(requete: FastifyRequest, scope: string): void {
  const contexte = obtenirContexte(requete);
  if (scope === 'ORGANISATION' && !contexte.organisationActiveId) {
    throw new ValidationError(
      "Le contexte d'organisation est obligatoire.",
      'AUDIT_SCOPE_ORGANISATION_REQUIRED',
    );
  }

  if (scope === 'ECOLE' && !contexte.ecoleActiveId) {
    throw new ValidationError(
      "Le contexte d'ecole est obligatoire.",
      'AUDIT_SCOPE_ECOLE_REQUIRED',
    );
  }
}

export function verifierObjetSerializable(valeur: unknown, code: string): void {
  if (valeur === undefined || valeur === null) {
    return;
  }

  const typeValeur = typeof valeur;
  if (typeValeur === 'function' || typeValeur === 'symbol' || typeValeur === 'bigint') {
    throw new ValidationError('Le payload HTTP Audit est invalide.', code);
  }
}

export function contientMotifDangereux(valeur: string): boolean {
  const texte = valeur.toLowerCase();
  return (
    texte.includes('__proto__')
    || texte.includes('<script')
    || texte.includes('union select')
    || texte.includes('drop table')
    || texte.includes('../')
    || texte.includes('%00')
  );
}

export function verifierContenuDangereux(valeur: unknown, code: string): void {
  if (typeof valeur === 'string') {
    if (contientMotifDangereux(valeur)) {
      throw new ValidationError('Le contenu de la requete Audit a ete refuse.', code);
    }
    return;
  }

  if (Array.isArray(valeur)) {
    valeur.forEach((element) => verifierContenuDangereux(element, code));
    return;
  }

  if (typeof valeur === 'object' && valeur !== null) {
    for (const entree of Object.values(valeur as Record<string, unknown>)) {
      verifierContenuDangereux(entree, code);
    }
  }
}
