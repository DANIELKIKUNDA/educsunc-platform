import type { RequestContext } from 'shared/context';

export type AuditAuthorizedScope = 'PLATEFORME' | 'ORGANISATION' | 'ECOLE';

export interface AuditHttpHeaders {
  readonly [key: string]: string | string[] | undefined;
}

export interface AuditHttpRequest<
  TBody = unknown,
  TParams = Record<string, unknown>,
  TQuery = Record<string, unknown>,
> {
  readonly body?: TBody;
  readonly params?: TParams;
  readonly query?: TQuery;
  readonly headers?: AuditHttpHeaders;
  readonly context?: RequestContext;
  readonly authorizedScope?: AuditAuthorizedScope;
}

export interface AuditHttpRuntimeMetadata {
  readonly requestId?: string;
  readonly correlationId?: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly modeOffline: boolean;
  readonly deviceId?: string;
  readonly durationMs: number;
}

export interface AuditHttpControllerResponse<TData> {
  readonly donnee: TData;
  readonly meta: AuditHttpRuntimeMetadata;
}

export interface AuditControllerRuntimeContext {
  readonly requestId?: string;
  readonly correlationId?: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly scope?: string;
  readonly modeOffline: boolean;
  readonly deviceId?: string;
  readonly utilisateurId?: string;
  readonly sessionId?: string;
  readonly roleActif?: string;
  readonly authorizedScope: AuditAuthorizedScope;
}

export interface AuditExecutable<TInput, TOutput> {
  executer(input: TInput): Promise<TOutput>;
}
