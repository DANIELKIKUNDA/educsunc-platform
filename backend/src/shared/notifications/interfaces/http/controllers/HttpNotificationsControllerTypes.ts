import type { RequestContext } from '../../../../context';

// Ce fichier declare les types communs des controllers HTTP Notifications.

/** Cette interface represente les headers HTTP utiles aux controllers Notifications. */
export interface HeadersHttpNotifications {
  readonly [key: string]: string | string[] | undefined;
}

/** Cette interface represente une requete HTTP abstraite pour les controllers Notifications. */
export interface RequeteHttpNotifications<
  TBody = unknown,
  TParams = Record<string, unknown>,
  TQuery = Record<string, unknown>,
> {
  readonly body?: TBody;
  readonly params?: TParams;
  readonly query?: TQuery;
  readonly headers?: HeadersHttpNotifications;
  readonly context?: RequestContext;
}

/** Cette interface represente les metadonnees runtime retournees par les controllers HTTP. */
export interface MetaRuntimeHttpNotifications {
  readonly requestId?: string;
  readonly correlationId?: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly modeOffline: boolean;
  readonly deviceId?: string;
  readonly durationMs: number;
}

/** Cette interface represente la reponse standard d'un controller HTTP Notifications. */
export interface ReponseControleurHttpNotifications<TData> {
  readonly statutHttp: number;
  readonly donnee: TData;
  readonly meta: MetaRuntimeHttpNotifications;
}

/** Cette interface represente le contexte runtime extrait de la requete HTTP. */
export interface ContexteRuntimeControleurNotifications {
  readonly requestId?: string;
  readonly correlationId?: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly modeOffline: boolean;
  readonly deviceId?: string;
  readonly utilisateurId?: string;
}

/** Cette interface represente un cas d'usage executable par un controller HTTP. */
export interface ExecutableNotification<TInput, TOutput> {
  executer(input: TInput): Promise<TOutput>;
}
