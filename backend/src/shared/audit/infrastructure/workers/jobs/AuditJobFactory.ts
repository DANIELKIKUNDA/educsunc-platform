import { randomUUID } from 'node:crypto';
import type { AuditWorkerJob, AuditWorkerJobType, AuditWorkerQueueName } from '../WorkerTypes';

export class AuditJobFactory {
  public creer<TPayload extends Record<string, unknown>>(
    type: AuditWorkerJobType,
    queue: AuditWorkerQueueName,
    payload: TPayload,
    metadata?: Partial<AuditWorkerJob<TPayload>['metadata']>,
  ): AuditWorkerJob<TPayload> {
    return {
      type,
      queue,
      payload,
      metadata: {
        jobId: metadata?.jobId ?? randomUUID(),
        queueName: metadata?.queueName ?? queue,
        workerName: metadata?.workerName,
        correlationId: metadata?.correlationId,
        requestId: metadata?.requestId,
        sessionId: metadata?.sessionId,
        utilisateurId: metadata?.utilisateurId,
        source: metadata?.source,
        replayId: metadata?.replayId,
        replayReason: metadata?.replayReason,
        replaySource: metadata?.replaySource,
        originalEventId: metadata?.originalEventId,
        originalActionDate: metadata?.originalActionDate,
        replayDate: metadata?.replayDate,
        organisationId: metadata?.organisationId,
        ecoleId: metadata?.ecoleId,
        scope: metadata?.scope,
        createdAt: metadata?.createdAt ?? new Date().toISOString(),
        startedAt: metadata?.startedAt,
        completedAt: metadata?.completedAt,
        failedAt: metadata?.failedAt,
        retryCount: metadata?.retryCount ?? 0,
        retryReason: metadata?.retryReason,
        retryLimit: metadata?.retryLimit ?? 5,
        retryBackoffMs: metadata?.retryBackoffMs ?? 250,
        nextRetryAt: metadata?.nextRetryAt,
        lastError: metadata?.lastError,
        retryHistory: metadata?.retryHistory ?? [],
      },
    };
  }
}
