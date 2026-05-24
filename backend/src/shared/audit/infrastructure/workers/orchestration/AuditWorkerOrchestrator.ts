import { AuditWorkerDeadLetterQueue } from '../dead-letter/AuditWorkerDeadLetterQueue';
import { AuditJobDispatcher } from '../dispatchers/AuditJobDispatcher';
import { AuditWorkerRetryService } from '../retry/AuditWorkerRetryService';
import { AuditWorkerReplayService } from '../replay/AuditWorkerReplayService';
import type { AuditWorkerExecutionResult, AuditWorkerJob } from '../WorkerTypes';
import { AuditExportJobRunner } from '../exports/AuditExportJobRunner';
import { AuditProjectionJobRunner } from '../projections/AuditProjectionJobRunner';
import { AuditSynchronizationJobRunner } from '../synchronization/AuditSynchronizationJobRunner';
import { AuditAnalyticsJobRunner } from '../analytics/AuditAnalyticsJobRunner';
import { AuditRetentionJobRunner } from '../retention/AuditRetentionJobRunner';
import { AuditMonitoringJobRunner } from '../monitoring/AuditMonitoringJobRunner';
import { obtenirAuditWorkerQueueMetrics } from '../queues/AuditWorkerQueueStore';

export class AuditWorkerOrchestrator {
  private readonly dispatcher = new AuditJobDispatcher();
  private readonly retry = new AuditWorkerRetryService();
  private readonly replay = new AuditWorkerReplayService();
  private readonly deadLetter = new AuditWorkerDeadLetterQueue();
  private readonly exportRunner = new AuditExportJobRunner();
  private readonly projectionRunner = new AuditProjectionJobRunner();
  private readonly synchronizationRunner = new AuditSynchronizationJobRunner();
  private readonly analyticsRunner = new AuditAnalyticsJobRunner();
  private readonly retentionRunner = new AuditRetentionJobRunner();
  private readonly monitoringRunner = new AuditMonitoringJobRunner();

  public dispatcherJob(job: AuditWorkerJob): void {
    this.dispatcher.dispatch(job);
  }

  public async executer(job: AuditWorkerJob): Promise<AuditWorkerExecutionResult> {
    const startedAt = job.metadata.startedAt ?? new Date().toISOString();
    const metrics = obtenirAuditWorkerQueueMetrics(job.queue);
    metrics.started += 1;
    metrics.lastStartedAt = startedAt;

    try {
      switch (job.type) {
        case 'GenerateExportJob':
          await this.exportRunner.executer(
            job.payload.request as Parameters<AuditExportJobRunner['executer']>[0],
            job.payload.filtres as Record<string, unknown> | undefined,
          );
          break;
        case 'ProjectionJob':
        case 'ReplayProjectionJob':
          await this.projectionRunner.executer(
            job.payload.auditEntry as Parameters<AuditProjectionJobRunner['executer']>[0],
          );
          break;
        case 'SyncBatchJob':
          await this.synchronizationRunner.executer(
            job.payload as Parameters<AuditSynchronizationJobRunner['executer']>[0],
          );
          break;
        case 'AnalyticsBatchJob':
          await this.analyticsRunner.executer();
          break;
        case 'RetentionCleanupJob':
        case 'ArchivePartitionJob':
          await this.retentionRunner.executer(
            typeof job.payload.reference === 'string' ? job.payload.reference : undefined,
          );
          break;
        case 'MonitoringRefreshJob':
          await this.monitoringRunner.executer();
          break;
      }

      const completedAt = new Date().toISOString();
      metrics.completed += 1;
      metrics.lastCompletedAt = completedAt;
      metrics.totalProcessingDurationMs += Math.max(
        0,
        new Date(completedAt).getTime() - new Date(startedAt).getTime(),
      );

      return {
        jobId: job.metadata.jobId,
        statut: 'SUCCES',
        message: `Job ${job.type} traite avec succes.`,
      };
    } catch (error) {
      metrics.failed += 1;
      metrics.lastFailedAt = new Date().toISOString();

      const retried = this.retry.reprogrammer(
        job,
        error instanceof Error ? error.message : 'UNKNOWN',
      );
      if (retried) {
        metrics.retried += 1;
        this.dispatcher.dispatch(retried);
        return {
          jobId: job.metadata.jobId,
          statut: 'REESSAYER',
          message: `Job ${job.type} reprogramme apres echec.`,
        };
      }

      this.deadLetter.ajouter(job, error instanceof Error ? error.message : 'UNKNOWN');
      metrics.deadLettered += 1;
      return {
        jobId: job.metadata.jobId,
        statut: 'DEAD_LETTER',
        message: `Job ${job.type} envoye en dead-letter.`,
      };
    }
  }

  public rejouer(job: AuditWorkerJob, replayId: string, raison: string): void {
    obtenirAuditWorkerQueueMetrics(job.queue).replayed += 1;
    this.dispatcher.dispatch(this.replay.rejouer(job, replayId, raison));
  }
}
