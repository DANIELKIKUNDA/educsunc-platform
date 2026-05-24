import type { AuditWorkerJob } from '../WorkerTypes';

export class AuditWorkerRetryService {
  public reprogrammer<TPayload extends Record<string, unknown>>(job: AuditWorkerJob<TPayload>, raison: string): AuditWorkerJob<TPayload> | null {
    const retryCount = job.metadata.retryCount + 1;
    if (retryCount > job.metadata.retryLimit) {
      return null;
    }
    const retryDate = new Date();

    return {
      ...job,
      metadata: {
        ...job.metadata,
        retryCount,
        retryReason: raison,
        lastError: raison,
        failedAt: retryDate.toISOString(),
        nextRetryAt: new Date(retryDate.getTime() + job.metadata.retryBackoffMs).toISOString(),
        retryHistory: [...job.metadata.retryHistory, `${new Date().toISOString()}:RETRY:${raison}`],
      },
    };
  }
}
