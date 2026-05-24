import type { AuditEventPublisher } from '../../event-bus';
import type { AuditWorkerJob } from '../../../infrastructure/workers';
import { AuditWorkerContextMapper } from '../mappers/AuditWorkerContextMapper';

function masquerErreur(lastError?: string): string | undefined {
  return lastError
    ?.replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, '[REDACTED_TOKEN]')
    .replace(/password\s*=\s*[^,\s]+/gi, 'password=[REDACTED]')
    .slice(0, 300);
}

// Ce publisher emet les evenements de cycle de vie worker vers l integration Event Bus Audit.
export class AuditWorkerLifecyclePublisher {
  public constructor(private readonly publisher: AuditEventPublisher) {}

  public async publier(name: string, job: AuditWorkerJob): Promise<void> {
    const contexte = AuditWorkerContextMapper.depuisJob(job);
    await this.publisher.publier({
      name,
      payload: {
        jobId: contexte.jobId,
        queueName: contexte.queue,
        workerName: contexte.worker,
        tentative: contexte.workerExecution.tentative,
        correlationId: contexte.correlationId,
        requestId: contexte.requestId,
        tenantContext: {
          organisationId: contexte.tenant.organisationId,
          ecoleId: contexte.tenant.ecoleId,
          scope: contexte.tenant.scope,
        },
        actorContext: {
          utilisateurId: contexte.actor.utilisateurId,
          sessionId: contexte.actor.sessionId,
          source: contexte.actor.source,
        },
        replayContext: {
          replayId: contexte.replay.replayId,
          replayReason: contexte.replay.replayReason,
          replaySource: contexte.replay.replaySource,
          originalEventId: contexte.replay.originalEventId,
          originalActionDate: contexte.replay.originalActionDate,
          replayDate: contexte.replay.replayDate,
        },
        retryContext: {
          retryCount: contexte.retry.retryCount,
          retryReason: contexte.retry.retryReason,
          retryBackoffMs: contexte.retry.retryBackoffMs,
          nextRetryAt: contexte.retry.nextRetryAt,
          lastError: masquerErreur(contexte.retry.lastError),
          retryHistory: contexte.retry.retryHistory,
        },
        createdAt: contexte.timestamps.createdAt,
        startedAt: contexte.timestamps.startedAt,
        completedAt: contexte.timestamps.completedAt,
        failedAt: contexte.timestamps.failedAt,
        deadLetterPayload:
          name === 'JOB_DEAD_LETTERED'
            ? {
                tenantContext: {
                  organisationId: contexte.tenant.organisationId,
                  ecoleId: contexte.tenant.ecoleId,
                  scope: contexte.tenant.scope,
                },
                correlationId: contexte.correlationId,
                workerName: contexte.worker,
                queueName: contexte.queue,
                maskedError: masquerErreur(contexte.retry.lastError),
                retryHistory: contexte.retry.retryHistory,
              }
            : undefined,
      },
    });
  }
}
