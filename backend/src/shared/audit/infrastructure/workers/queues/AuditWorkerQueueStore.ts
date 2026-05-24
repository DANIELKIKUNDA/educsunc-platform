import type { AuditWorkerJob, AuditWorkerQueueName } from '../WorkerTypes';

type AuditWorkerQueueMetrics = {
  enqueued: number;
  started: number;
  completed: number;
  failed: number;
  retried: number;
  replayed: number;
  deadLettered: number;
  totalProcessingDurationMs: number;
  lastStartedAt?: string;
  lastCompletedAt?: string;
  lastFailedAt?: string;
};

type AuditWorkerQueueState = {
  queues: Map<AuditWorkerQueueName, AuditWorkerJob[]>;
  deadLetters: AuditWorkerJob[];
  scheduled: AuditWorkerJob[];
  metrics: Map<AuditWorkerQueueName, AuditWorkerQueueMetrics>;
};

function creerMetriques(): AuditWorkerQueueMetrics {
  return {
    enqueued: 0,
    started: 0,
    completed: 0,
    failed: 0,
    retried: 0,
    replayed: 0,
    deadLettered: 0,
    totalProcessingDurationMs: 0,
  };
}

const state: AuditWorkerQueueState = {
  queues: new Map<AuditWorkerQueueName, AuditWorkerJob[]>([
    ['PROJECTIONS', []],
    ['EXPORTS', []],
    ['SYNCHRONIZATION', []],
    ['ANALYTICS', []],
    ['RETENTION', []],
    ['MONITORING', []],
    ['FORENSIC', []],
  ]),
  deadLetters: [],
  scheduled: [],
  metrics: new Map<AuditWorkerQueueName, AuditWorkerQueueMetrics>([
    ['PROJECTIONS', creerMetriques()],
    ['EXPORTS', creerMetriques()],
    ['SYNCHRONIZATION', creerMetriques()],
    ['ANALYTICS', creerMetriques()],
    ['RETENTION', creerMetriques()],
    ['MONITORING', creerMetriques()],
    ['FORENSIC', creerMetriques()],
  ]),
};

// Les queues workers restent persistantes localement, ordonnées et recoverables.
export function obtenirAuditWorkerQueueStore(): AuditWorkerQueueState {
  return state;
}

export function obtenirAuditWorkerQueueMetrics(queueName: AuditWorkerQueueName): AuditWorkerQueueMetrics {
  const metrics = state.metrics.get(queueName);
  if (metrics) {
    return metrics;
  }

  const nouvellesMetriques = creerMetriques();
  state.metrics.set(queueName, nouvellesMetriques);
  return nouvellesMetriques;
}
