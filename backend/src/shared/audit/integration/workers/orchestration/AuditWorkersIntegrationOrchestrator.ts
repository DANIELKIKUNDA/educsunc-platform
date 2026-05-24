import type { AuditEventPublisher } from '../../event-bus';
import {
  AuditJobFactory,
  AuditWorkerOrchestrator,
  type AuditWorkerExecutionResult,
  type AuditWorkerJob,
  type AuditWorkerJobType,
  type AuditWorkerQueueName,
} from '../../../infrastructure/workers';
import { AuditWorkerLifecyclePublisher } from '../publishers/AuditWorkerLifecyclePublisher';
import { AuditWorkerTenantGuard } from '../guards/AuditWorkerTenantGuard';
import { AuditWorkersQueueMonitoringBridge } from '../monitoring/AuditWorkersQueueMonitoringBridge';

// Cet orchestrateur relie les queues/workers existants aux exigences Audit de correlation, tenant et forensic.
export class AuditWorkersIntegrationOrchestrator {
  private readonly lifecycle: AuditWorkerLifecyclePublisher;
  private readonly tenantGuard = new AuditWorkerTenantGuard();
  private readonly monitoring = new AuditWorkersQueueMonitoringBridge();
  private readonly jobFactory = new AuditJobFactory();

  public constructor(
    publisher: AuditEventPublisher,
    private readonly workers: AuditWorkerOrchestrator = new AuditWorkerOrchestrator(),
  ) {
    this.lifecycle = new AuditWorkerLifecyclePublisher(publisher);
  }

  public creerJob<TPayload extends Record<string, unknown>>(
    type: AuditWorkerJobType,
    queue: AuditWorkerQueueName,
    payload: TPayload,
    metadata?: Partial<AuditWorkerJob<TPayload>['metadata']>,
  ): AuditWorkerJob<TPayload> {
    return this.jobFactory.creer(type, queue, payload, metadata);
  }

  public async enqueue(job: AuditWorkerJob): Promise<void> {
    try {
      this.tenantGuard.verifier(job);
    } catch (error) {
      const rejectedJob: AuditWorkerJob = {
        ...job,
        metadata: {
          ...job.metadata,
          failedAt: new Date().toISOString(),
          lastError: error instanceof Error ? error.message : 'TENANT_REJECTED',
        },
      };
      await this.lifecycle.publier('JOB_FAILED', rejectedJob);
      throw error;
    }
    this.workers.dispatcherJob(job);
    await this.lifecycle.publier('JOB_ENQUEUED', job);
  }

  public async executer(job: AuditWorkerJob): Promise<AuditWorkerExecutionResult> {
    try {
      this.tenantGuard.verifier(job);
    } catch (error) {
      const rejectedJob: AuditWorkerJob = {
        ...job,
        metadata: {
          ...job.metadata,
          failedAt: new Date().toISOString(),
          lastError: error instanceof Error ? error.message : 'TENANT_REJECTED',
        },
      };
      await this.lifecycle.publier('JOB_FAILED', rejectedJob);
      throw error;
    }
    const startedJob: AuditWorkerJob = {
      ...job,
      metadata: {
        ...job.metadata,
        startedAt: new Date().toISOString(),
      },
    };
    await this.lifecycle.publier('JOB_STARTED', startedJob);

    const resultat = await this.workers.executer(startedJob);
    const horodatage = new Date().toISOString();

    if (resultat.statut === 'SUCCES') {
      await this.lifecycle.publier('JOB_COMPLETED', {
        ...startedJob,
        metadata: {
          ...startedJob.metadata,
          completedAt: horodatage,
        },
      });
    } else if (resultat.statut === 'REESSAYER') {
      await this.lifecycle.publier('JOB_RETRIED', {
        ...startedJob,
        metadata: {
          ...startedJob.metadata,
          failedAt: horodatage,
          lastError: resultat.message,
        },
      });
    } else if (resultat.statut === 'DEAD_LETTER') {
      await this.lifecycle.publier('JOB_DEAD_LETTERED', {
        ...startedJob,
        metadata: {
          ...startedJob.metadata,
          failedAt: horodatage,
          lastError: resultat.message,
        },
      });
    } else {
      await this.lifecycle.publier('JOB_FAILED', {
        ...startedJob,
        metadata: {
          ...startedJob.metadata,
          failedAt: horodatage,
          lastError: resultat.message,
        },
      });
    }

    return resultat;
  }

  public async rejouer(job: AuditWorkerJob, replayId: string, raison: string): Promise<void> {
    await this.lifecycle.publier('JOB_REPLAYED', {
      ...job,
      metadata: {
        ...job.metadata,
        replayId,
        replayReason: raison,
        replayDate: new Date().toISOString(),
      },
    });
    this.workers.rejouer(job, replayId, raison);
  }

  public obtenirMonitoring() {
    return this.monitoring.obtenirSnapshot();
  }
}
