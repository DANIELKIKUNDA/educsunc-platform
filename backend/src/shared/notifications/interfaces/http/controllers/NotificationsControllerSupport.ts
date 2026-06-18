import type {
  ContexteRuntimeControleurNotifications,
  ExecutableNotification,
  HeadersHttpNotifications,
  ReponseControleurHttpNotifications,
  RequeteHttpNotifications,
} from './HttpNotificationsControllerTypes';

// Ce fichier centralise les helpers partages des controllers HTTP Notifications.

function lireHeader(headers: HeadersHttpNotifications | undefined, cle: string): string | undefined {
  const valeur = headers?.[cle];
  if (typeof valeur === 'string') {
    return valeur;
  }
  if (Array.isArray(valeur) && typeof valeur[0] === 'string') {
    return valeur[0];
  }
  return undefined;
}

/** Cette fonction extrait le contexte runtime utile a partir d'une requete HTTP. */
export function extraireContexteRuntime(
  requete: RequeteHttpNotifications<unknown, unknown, unknown>,
): ContexteRuntimeControleurNotifications {
  return {
    requestId: requete.context?.requestId ?? lireHeader(requete.headers, 'x-request-id'),
    correlationId: requete.context?.correlationId ?? lireHeader(requete.headers, 'x-correlation-id'),
    organisationId:
      requete.context?.organisationActiveId ?? lireHeader(requete.headers, 'x-organisation-id'),
    ecoleId: requete.context?.ecoleActiveId ?? lireHeader(requete.headers, 'x-ecole-id'),
    modeOffline:
      requete.context?.modeOffline ?? lireHeader(requete.headers, 'x-offline-mode') === 'true',
    deviceId: requete.context?.deviceId ?? lireHeader(requete.headers, 'x-device-id'),
    utilisateurId: requete.context?.utilisateurId,
  };
}

/** Cette fonction injecte le contexte tenant et correlation si l'entree ne les porte pas deja. */
export function enrichirContexte<T extends object>(
  entree: T,
  contexte: ContexteRuntimeControleurNotifications,
): T {
  return {
    ...entree,
    organisationId: (entree as { organisationId?: string }).organisationId ?? contexte.organisationId,
    ecoleId: (entree as { ecoleId?: string }).ecoleId ?? contexte.ecoleId,
    correlationId: (entree as { correlationId?: string }).correlationId ?? contexte.correlationId,
    requestId: (entree as { requestId?: string }).requestId ?? contexte.requestId,
    acteurId: (entree as { acteurId?: string }).acteurId ?? contexte.utilisateurId,
  };
}

/** Cette fonction execute un cas d'usage ou une fonction asynchrone uniforme. */
export async function executerDependance<TInput, TOutput>(
  dependance: ExecutableNotification<TInput, TOutput> | ((input: TInput) => Promise<TOutput>),
  input: TInput,
): Promise<TOutput> {
  if (typeof dependance === 'function') {
    return dependance(input);
  }
  return dependance.executer(input);
}

/** Cette fonction construit l'enveloppe de reponse HTTP standard du module Notifications. */
export function envelopperReponse<TData>(
  donnee: TData,
  contexte: ContexteRuntimeControleurNotifications,
  commenceLe: number,
  statutHttp = 200,
): ReponseControleurHttpNotifications<TData> {
  return {
    statutHttp,
    donnee,
    meta: {
      requestId: contexte.requestId,
      correlationId: contexte.correlationId,
      organisationId: contexte.organisationId,
      ecoleId: contexte.ecoleId,
      modeOffline: contexte.modeOffline,
      deviceId: contexte.deviceId,
      durationMs: Date.now() - commenceLe,
    },
  };
}

/** Cette fonction force la presence d'un resultat attendu. */
export function exigerResultat<T>(valeur: T | null | undefined, message: string): T {
  if (valeur == null) {
    throw new Error(message);
  }
  return valeur;
}
