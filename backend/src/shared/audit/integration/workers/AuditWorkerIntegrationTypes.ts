import type { AuditWorkerJob, AuditWorkerQueueName } from '../../infrastructure/workers';

export interface WorkerExecutionContext {
  readonly jobId: string;
  readonly queue: AuditWorkerQueueName;
  readonly worker?: string;
  readonly workerExecution: {
    readonly queueName: AuditWorkerQueueName;
    readonly workerName?: string;
    readonly tentative: number;
  };
  readonly tenant: {
    readonly organisationId?: string;
    readonly ecoleId?: string;
    readonly scope?: string;
  };
  readonly actor: {
    readonly utilisateurId?: string;
    readonly sessionId?: string;
    readonly source?: string;
  };
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly replay: {
    readonly replayId?: string;
    readonly replayReason?: string;
    readonly replaySource?: string;
    readonly originalEventId?: string;
    readonly originalActionDate?: string;
    readonly replayDate?: string;
  };
  readonly retry: {
    readonly retryCount: number;
    readonly retryReason?: string;
    readonly retryBackoffMs: number;
    readonly nextRetryAt?: string;
    readonly lastError?: string;
    readonly retryHistory: readonly string[];
  };
  readonly timestamps: {
    readonly createdAt: string;
    readonly startedAt?: string;
    readonly completedAt?: string;
    readonly failedAt?: string;
  };
}

export interface AuditWorkerLifecycleEvent {
  readonly name:
    | 'JOB_ENQUEUED'
    | 'JOB_STARTED'
    | 'JOB_COMPLETED'
    | 'JOB_FAILED'
    | 'JOB_RETRIED'
    | 'JOB_DEAD_LETTERED'
    | 'JOB_REPLAYED';
  readonly job: AuditWorkerJob;
  readonly contexte: WorkerExecutionContext;
}
