import type { FastifyRequest } from 'fastify';
import type { RequestContext as SharedRequestContext } from 'shared/context';
import type { CorrelationContext } from './CorrelationContext';
import type { DeviceContext } from './DeviceContext';
import type { ForensicContext } from './ForensicContext';
import type { MonitoringContext } from './MonitoringContext';
import type { ReplayContext } from './ReplayContext';
import type { RequestContext } from './RequestContext';
import type { RetryContext } from './RetryContext';
import type { RuntimeContext } from './RuntimeContext';
import type { SynchronizationContext } from './SynchronizationContext';
import type { TraceContext } from './TraceContext';

export interface AuditContext {
  readonly requestId: string;
  readonly correlationId: string;
  readonly tenant: {
    readonly organisationId?: string;
    readonly ecoleId?: string;
    readonly scopes: readonly string[];
  };
  readonly utilisateur: {
    readonly utilisateurId?: string;
    readonly sessionId?: string;
    readonly roleActif?: string;
  };
  readonly permissions: readonly string[];
  readonly request: RequestContext;
  readonly correlation: CorrelationContext;
  readonly runtime: RuntimeContext;
  readonly forensic: ForensicContext;
  readonly replay: ReplayContext;
  readonly retry: RetryContext;
  readonly synchronization: SynchronizationContext;
  readonly device: DeviceContext;
  readonly monitoring: MonitoringContext;
  readonly trace: TraceContext;
  readonly adresseIp?: string;
  readonly userAgent?: string;
  readonly timestamps: {
    readonly recuAt: string;
    readonly startedAt?: string;
  };
}

function lireHeaderTexte(requete: FastifyRequest, nom: string): string | undefined {
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

function lireHeaderNombre(requete: FastifyRequest, nom: string): number | undefined {
  const brut = lireHeaderTexte(requete, nom);
  if (!brut) {
    return undefined;
  }
  const valeur = Number(brut);
  return Number.isFinite(valeur) ? valeur : undefined;
}

function lireHeadersUtiles(requete: FastifyRequest): Record<string, string> {
  const noms = [
    'x-request-id',
    'x-correlation-id',
    'x-parent-correlation-id',
    'x-workflow-id',
    'x-causation-id',
    'x-device-id',
    'x-app-version',
    'x-platform',
    'x-sync-id',
    'x-sync-source',
    'x-sync-target',
    'x-sync-version',
    'x-offline-mode',
    'x-replay-id',
    'x-replay-reason',
    'x-replay-source',
    'x-replay-window',
    'x-retry-reason',
    'x-retry-window',
    'user-agent',
  ] as const;

  const resultat: Record<string, string> = {};
  for (const nom of noms) {
    const valeur = lireHeaderTexte(requete, nom);
    if (valeur) {
      resultat[nom] = valeur;
    }
  }
  return resultat;
}

export function creerAuditContext(
  requete: FastifyRequest,
  contexte: SharedRequestContext,
): AuditContext {
  const recuAt = new Date().toISOString();
  const requestId = contexte.requestId;
  const correlationId = contexte.correlationId ?? requestId;
  const headersUtiles = lireHeadersUtiles(requete);
  const replay: ReplayContext = {
    replayId: lireHeaderTexte(requete, 'x-replay-id'),
    replayReason: lireHeaderTexte(requete, 'x-replay-reason'),
    replaySource: lireHeaderTexte(requete, 'x-replay-source'),
    replayDepth: lireHeaderNombre(requete, 'x-replay-depth'),
    replayTimestamp: lireHeaderTexte(requete, 'x-replay-timestamp'),
    replayWindow: lireHeaderTexte(requete, 'x-replay-window'),
  };
  const retry: RetryContext = {
    retryCount: lireHeaderNombre(requete, 'x-retry-count') ?? 0,
    retryReason: lireHeaderTexte(requete, 'x-retry-reason'),
    retryHistory: lireHeaderTexte(requete, 'x-retry-history')?.split(',').map((item) => item.trim()).filter(Boolean) ?? [],
    retryBackoff: lireHeaderNombre(requete, 'x-retry-backoff'),
    retryWindow: lireHeaderTexte(requete, 'x-retry-window'),
  };
  const device: DeviceContext = {
    deviceId: contexte.deviceId,
    platform: contexte.plateforme,
    appVersion: contexte.appVersion,
    runtimeVersion: process.version,
    os: process.platform,
    networkMetadata: {
      modeOffline: contexte.modeOffline,
      adresseIp: contexte.adresseIp ?? requete.ip,
    },
  };
  const synchronization: SynchronizationContext = {
    syncId: contexte.syncId,
    syncSource: lireHeaderTexte(requete, 'x-sync-source'),
    syncTarget: lireHeaderTexte(requete, 'x-sync-target'),
    offlineDuration: lireHeaderNombre(requete, 'x-offline-duration'),
    syncVersion: lireHeaderTexte(requete, 'x-sync-version'),
    chronologyMetadata: {
      requestId,
      correlationId,
      modeOffline: contexte.modeOffline,
    },
    deviceMetadata: {
      deviceId: device.deviceId ?? '',
      platform: device.platform ?? '',
      appVersion: device.appVersion ?? '',
    },
  };
  const request: RequestContext = {
    requestId,
    route: requete.routeOptions.url,
    methode: requete.method,
    headersUtiles,
    timing: {
      recuAt,
    },
    adresseIp: contexte.adresseIp ?? requete.ip,
    userAgent: contexte.userAgent,
  };
  const correlation: CorrelationContext = {
    correlationId,
    parentCorrelationId: lireHeaderTexte(requete, 'x-parent-correlation-id'),
    workflowId: lireHeaderTexte(requete, 'x-workflow-id'),
    causationId: lireHeaderTexte(requete, 'x-causation-id'),
    eventChain: lireHeaderTexte(requete, 'x-event-chain')?.split(',').map((item) => item.trim()).filter(Boolean) ?? [],
  };
  const runtime: RuntimeContext = {
    environnement: process.env.NODE_ENV ?? 'development',
    runtime: 'FASTIFY',
    node: process.version,
    worker: lireHeaderTexte(requete, 'x-worker-id'),
    queue: lireHeaderTexte(requete, 'x-queue-name'),
    scheduler: lireHeaderTexte(requete, 'x-scheduler-id'),
    instance: process.env.HOSTNAME ?? process.env.COMPUTERNAME,
    version: contexte.appVersion,
  };
  const forensic: ForensicContext = {
    chronology: {
      dateReceptionServeur: recuAt,
      dateActionOriginale: lireHeaderTexte(requete, 'x-original-action-at'),
    },
    replayMetadata: {
      replayId: replay.replayId ?? '',
      replayReason: replay.replayReason ?? '',
    },
    retryMetadata: {
      retryCount: retry.retryCount,
      retryReason: retry.retryReason ?? '',
    },
    syncMetadata: {
      syncId: synchronization.syncId ?? '',
      syncSource: synchronization.syncSource ?? '',
      syncTarget: synchronization.syncTarget ?? '',
    },
    incidentMetadata: {
      requestId,
      correlationId,
    },
    investigationMetadata: {
      workflowId: correlation.workflowId ?? '',
      causationId: correlation.causationId ?? '',
    },
  };
  const monitoring: MonitoringContext = {
    timings: {
      requestStartedAt: recuAt,
    },
    metriques: {
      modeOffline: contexte.modeOffline,
      permissions: contexte.permissions.length,
      scopes: contexte.scopes.length,
    },
    traces: [requestId, correlationId],
    queueTimings: {},
    workerTimings: {},
    projectionTimings: {},
  };
  const trace: TraceContext = {
    traceId: lireHeaderTexte(requete, 'x-trace-id') ?? correlationId,
    spanId: lireHeaderTexte(requete, 'x-span-id') ?? requestId,
    parentSpanId: lireHeaderTexte(requete, 'x-parent-span-id'),
    requestId,
    correlationId,
  };

  return {
    requestId,
    correlationId,
    tenant: {
      organisationId: contexte.organisationActiveId,
      ecoleId: contexte.ecoleActiveId,
      scopes: contexte.scopes.map((scope) => `${scope.obtenirTypeScope().obtenirValeur()}:${scope.obtenirValeurScope()}`),
    },
    utilisateur: {
      utilisateurId: contexte.utilisateurId,
      sessionId: contexte.sessionId,
      roleActif: contexte.roleActif,
    },
    permissions: [...contexte.permissions],
    request,
    correlation,
    runtime,
    forensic,
    replay,
    retry,
    synchronization,
    device,
    monitoring,
    trace,
    adresseIp: contexte.adresseIp,
    userAgent: contexte.userAgent,
    timestamps: {
      recuAt,
      startedAt: request.timing.startedAt,
    },
  };
}

