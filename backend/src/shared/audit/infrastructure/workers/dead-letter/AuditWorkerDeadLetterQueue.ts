import { obtenirAuditWorkerQueueStore } from '../queues/AuditWorkerQueueStore';
import type { AuditWorkerJob } from '../WorkerTypes';

function masquerErreur(raison: string): string {
  return raison
    .replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, '[REDACTED_TOKEN]')
    .replace(/password\\s*=\\s*[^,\\s]+/gi, 'password=[REDACTED]')
    .slice(0, 300);
}

export class AuditWorkerDeadLetterQueue {
  public ajouter(job: AuditWorkerJob, raison: string): void {
    const maskedReason = masquerErreur(raison);
    obtenirAuditWorkerQueueStore().deadLetters.push({
      ...job,
      metadata: {
        ...job.metadata,
        failedAt: job.metadata.failedAt ?? new Date().toISOString(),
        lastError: maskedReason,
      },
      payload: {
        deadLetterReason: maskedReason,
        tenant: {
          organisationId: job.metadata.organisationId,
          ecoleId: job.metadata.ecoleId,
          scope: job.metadata.scope,
        },
        tracing: {
          correlationId: job.metadata.correlationId,
          requestId: job.metadata.requestId,
        },
        worker: {
          queueName: job.metadata.queueName ?? job.queue,
          workerName: job.metadata.workerName,
        },
        replay: {
          replayId: job.metadata.replayId,
          replayReason: job.metadata.replayReason,
          replaySource: job.metadata.replaySource,
        },
        retryHistory: [...job.metadata.retryHistory],
      },
    });
  }

  public lister(): AuditWorkerJob[] {
    return [...obtenirAuditWorkerQueueStore().deadLetters];
  }
}
