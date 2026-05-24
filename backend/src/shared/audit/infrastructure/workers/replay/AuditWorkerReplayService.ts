import type { AuditWorkerJob } from '../WorkerTypes';

export class AuditWorkerReplayService {
  public rejouer<TPayload extends Record<string, unknown>>(job: AuditWorkerJob<TPayload>, replayId: string, raison: string): AuditWorkerJob<TPayload> {
    const replayDate = new Date().toISOString();
    return {
      ...job,
      metadata: {
        ...job.metadata,
        replayId,
        replayReason: raison,
        replayDate,
        originalEventId: job.metadata.originalEventId ?? job.metadata.jobId,
        originalActionDate: job.metadata.originalActionDate ?? job.metadata.createdAt,
        retryHistory: [...job.metadata.retryHistory, `${new Date().toISOString()}:REPLAY:${raison}`],
      },
    };
  }
}
