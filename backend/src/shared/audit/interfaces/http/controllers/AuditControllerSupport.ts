import type {
  AuditControllerRuntimeContext,
  AuditExecutable,
  AuditHttpControllerResponse,
  AuditHttpHeaders,
  AuditHttpRequest,
} from './HttpAuditControllerTypes';
import { AuditTenantScopePolicy } from './AuditTenantScopePolicy';

function lireHeader(headers: AuditHttpHeaders | undefined, key: string): string | undefined {
  const value = headers?.[key];
  if (typeof value === 'string') {
    return value;
  }
  if (Array.isArray(value) && typeof value[0] === 'string') {
    return value[0];
  }

  return undefined;
}

export function extraireContexteRuntime(
  requete: AuditHttpRequest<unknown, unknown, unknown>,
): AuditControllerRuntimeContext {
  const contexteAuthentifie = requete.context;
  const organisationIdBrut = contexteAuthentifie
    ? contexteAuthentifie.organisationActiveId
    : lireHeader(requete.headers, 'x-organisation-id');
  const ecoleIdBrut = contexteAuthentifie
    ? contexteAuthentifie.ecoleActiveId
    : lireHeader(requete.headers, 'x-ecole-id');
  const organisationId = typeof organisationIdBrut === 'string' && organisationIdBrut.trim()
    ? organisationIdBrut
    : undefined;
  const ecoleId = typeof ecoleIdBrut === 'string' && ecoleIdBrut.trim()
    ? ecoleIdBrut
    : undefined;
  const roleActif = contexteAuthentifie?.roleActif;
  const acteurPlateforme = roleActif !== undefined
    && ['MANAGER_SYSTEME', 'OPERATEUR_SYSTEME', 'SUPPORT_SYSTEME'].includes(roleActif);
  const authorizedScope = acteurPlateforme && !requete.authorizedScope
    ? 'PLATEFORME'
    : AuditTenantScopePolicy.inferer(requete.authorizedScope, organisationId, ecoleId);

  return {
    requestId: contexteAuthentifie?.requestId ?? lireHeader(requete.headers, 'x-request-id'),
    correlationId:
      contexteAuthentifie?.correlationId ?? lireHeader(requete.headers, 'x-correlation-id'),
    organisationId,
    ecoleId,
    scope: authorizedScope,
    authorizedScope,
    modeOffline: contexteAuthentifie?.modeOffline ?? lireHeader(requete.headers, 'x-offline-mode') === 'true',
    deviceId: contexteAuthentifie?.deviceId ?? lireHeader(requete.headers, 'x-device-id'),
    utilisateurId: contexteAuthentifie?.utilisateurId,
    sessionId: contexteAuthentifie?.sessionId,
    roleActif,
  };
}

export function enrichirTenant<T extends object>(
  input: T,
  contexte: AuditControllerRuntimeContext,
): T {
  const inputAvecTenant = input as T & { organisationId?: string; ecoleId?: string };
  return AuditTenantScopePolicy.appliquer(inputAvecTenant, contexte);
}

export async function executerDependance<TInput, TOutput>(
  dependance: AuditExecutable<TInput, TOutput> | ((input: TInput) => Promise<TOutput>),
  input: TInput,
): Promise<TOutput> {
  if (typeof dependance === 'function') {
    return dependance(input);
  }

  return dependance.executer(input);
}

export function envelopperReponse<TData>(
  donnee: TData,
  contexte: AuditControllerRuntimeContext,
  startedAt: number,
): AuditHttpControllerResponse<TData> {
  return {
    donnee,
    meta: {
      requestId: contexte.requestId,
      correlationId: contexte.correlationId,
      organisationId: contexte.organisationId,
      ecoleId: contexte.ecoleId,
      modeOffline: contexte.modeOffline,
      deviceId: contexte.deviceId,
      durationMs: Date.now() - startedAt,
    },
  };
}
