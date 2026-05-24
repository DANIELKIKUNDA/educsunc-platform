import type {
  AuditControllerRuntimeContext,
  AuditExecutable,
  AuditHttpControllerResponse,
  AuditHttpHeaders,
  AuditHttpRequest,
} from './HttpAuditControllerTypes';

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
  return {
    requestId: requete.context?.requestId ?? lireHeader(requete.headers, 'x-request-id'),
    correlationId:
      requete.context?.correlationId ?? lireHeader(requete.headers, 'x-correlation-id'),
    organisationId: requete.context?.organisationActiveId ?? lireHeader(requete.headers, 'x-organisation-id'),
    ecoleId: requete.context?.ecoleActiveId ?? lireHeader(requete.headers, 'x-ecole-id'),
    scope:
      requete.context?.ecoleActiveId != null
        ? 'ECOLE'
        : requete.context?.organisationActiveId != null
          ? 'ORGANISATION'
          : undefined,
    modeOffline: requete.context?.modeOffline ?? lireHeader(requete.headers, 'x-offline-mode') === 'true',
    deviceId: requete.context?.deviceId ?? lireHeader(requete.headers, 'x-device-id'),
    utilisateurId: requete.context?.utilisateurId,
    sessionId: requete.context?.sessionId,
    roleActif: requete.context?.roleActif,
  };
}

export function enrichirTenant<T extends object>(
  input: T,
  contexte: AuditControllerRuntimeContext,
): T {
  return {
    ...input,
    organisationId: (input as { organisationId?: string }).organisationId ?? contexte.organisationId,
    ecoleId: (input as { ecoleId?: string }).ecoleId ?? contexte.ecoleId,
    correlationId: (input as { correlationId?: string }).correlationId ?? contexte.correlationId,
  };
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
