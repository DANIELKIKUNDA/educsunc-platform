import type { AuditWorkerJob } from '../../../infrastructure/workers';
import type { WorkerExecutionContext } from '../AuditWorkerIntegrationTypes';

// Ce mapper reconstruit le contexte d execution worker a partir de la metadata du job.
export class AuditWorkerContextMapper {
  public static depuisJob(job: AuditWorkerJob): WorkerExecutionContext {
    return {
      jobId: job.metadata.jobId,
      queue: job.queue,
      worker: job.metadata.workerName,
      workerExecution: {
        queueName: job.metadata.queueName ?? job.queue,
        workerName: job.metadata.workerName,
        tentative: job.metadata.retryCount + 1,
      },
      tenant: {
        organisationId: job.metadata.organisationId,
        ecoleId: job.metadata.ecoleId,
        scope: job.metadata.scope,
      },
      actor: {
        utilisateurId: job.metadata.utilisateurId,
        sessionId: job.metadata.sessionId,
        source: job.metadata.source,
      },
      correlationId: job.metadata.correlationId,
      requestId: job.metadata.requestId,
      replay: {
        replayId: job.metadata.replayId,
        replayReason: job.metadata.replayReason,
        replaySource: job.metadata.replaySource,
        originalEventId: job.metadata.originalEventId,
        originalActionDate: job.metadata.originalActionDate,
        replayDate: job.metadata.replayDate,
      },
      retry: {
        retryCount: job.metadata.retryCount,
        retryReason: job.metadata.retryReason,
        retryBackoffMs: job.metadata.retryBackoffMs,
        nextRetryAt: job.metadata.nextRetryAt,
        lastError: job.metadata.lastError,
        retryHistory: job.metadata.retryHistory,
      },
      timestamps: {
        createdAt: job.metadata.createdAt,
        startedAt: job.metadata.startedAt,
        completedAt: job.metadata.completedAt,
        failedAt: job.metadata.failedAt,
      },
    };
  }
}
