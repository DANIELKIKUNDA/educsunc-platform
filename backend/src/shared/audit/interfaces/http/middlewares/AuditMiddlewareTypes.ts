import type { FastifyReply, FastifyRequest } from 'fastify';

export interface AuditMiddlewareResultatErreur {
  readonly statutHttp: number;
  readonly corps: unknown;
}

export interface AuditMiddlewareOptionsThrottling {
  readonly cle?: string;
  readonly limite?: number;
  readonly fenetreMs?: number;
}

export interface AuditMonitoringSnapshot {
  readonly requestId: string;
  readonly correlationId?: string;
  readonly startedAt: number;
  readonly requestSize: number;
  readonly deviceId?: string;
  readonly appVersion?: string;
  readonly plateforme?: string;
  readonly modeOffline?: boolean;
  readonly syncId?: string;
}

export type AuditHookSimple = (
  requete: FastifyRequest,
  reponse: FastifyReply,
) => Promise<void> | void;
