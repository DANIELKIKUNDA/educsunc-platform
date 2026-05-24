import { PersistentAuditJobQueue } from '../queues/PersistentAuditJobQueue';
import { AuditWorkerDeadLetterQueue } from '../dead-letter/AuditWorkerDeadLetterQueue';
import { obtenirAuditWorkerQueueMetrics, obtenirAuditWorkerQueueStore } from '../queues/AuditWorkerQueueStore';

function calculerLag(jobDates: Array<string | undefined>): number {
  const oldest = jobDates
    .filter((value): value is string => typeof value === 'string')
    .sort()[0];

  if (!oldest) {
    return 0;
  }

  return Math.max(0, Date.now() - new Date(oldest).getTime());
}

export class AuditWorkerMonitoringService {
  public constructor(
    private readonly queue: PersistentAuditJobQueue = new PersistentAuditJobQueue(),
    private readonly deadLetter: AuditWorkerDeadLetterQueue = new AuditWorkerDeadLetterQueue(),
  ) {}

  public obtenirSnapshot() {
    const projections = this.queue.list('PROJECTIONS');
    const exports = this.queue.list('EXPORTS');
    const synchronization = this.queue.list('SYNCHRONIZATION');
    const analytics = this.queue.list('ANALYTICS');
    const retention = this.queue.list('RETENTION');
    const monitoring = this.queue.list('MONITORING');
    const forensic = this.queue.list('FORENSIC');
    const queueNames = [
      'PROJECTIONS',
      'EXPORTS',
      'SYNCHRONIZATION',
      'ANALYTICS',
      'RETENTION',
      'MONITORING',
      'FORENSIC',
    ] as const;
    const metrics = queueNames.reduce<Record<string, ReturnType<typeof obtenirAuditWorkerQueueMetrics>>>(
      (accumulator, queueName) => {
        accumulator[queueName] = { ...obtenirAuditWorkerQueueMetrics(queueName) };
        return accumulator;
      },
      {},
    );
    const deadLetters = this.deadLetter.lister();
    const backlog =
      projections.length +
      exports.length +
      synchronization.length +
      analytics.length +
      retention.length +
      monitoring.length +
      forensic.length;
    const globalMetrics = Object.values(metrics).reduce(
      (accumulator, queueMetrics) => ({
        started: accumulator.started + queueMetrics.started,
        completed: accumulator.completed + queueMetrics.completed,
        failed: accumulator.failed + queueMetrics.failed,
        retried: accumulator.retried + queueMetrics.retried,
        deadLettered: accumulator.deadLettered + queueMetrics.deadLettered,
        totalProcessingDurationMs:
          accumulator.totalProcessingDurationMs + queueMetrics.totalProcessingDurationMs,
      }),
      {
        started: 0,
        completed: 0,
        failed: 0,
        retried: 0,
        deadLettered: 0,
        totalProcessingDurationMs: 0,
      },
    );

    return {
      projections: projections.length,
      exports: exports.length,
      synchronization: synchronization.length,
      analytics: analytics.length,
      retention: retention.length,
      monitoring: monitoring.length,
      forensic: forensic.length,
      scheduled: obtenirAuditWorkerQueueStore().scheduled.length,
      deadLetters: deadLetters.length,
      backlog,
      queueLagMs: {
        projections: calculerLag(projections.map((job) => job.metadata.createdAt)),
        exports: calculerLag(exports.map((job) => job.metadata.createdAt)),
        synchronization: calculerLag(synchronization.map((job) => job.metadata.createdAt)),
        analytics: calculerLag(analytics.map((job) => job.metadata.createdAt)),
        retention: calculerLag(retention.map((job) => job.metadata.createdAt)),
        monitoring: calculerLag(monitoring.map((job) => job.metadata.createdAt)),
        forensic: calculerLag(forensic.map((job) => job.metadata.createdAt)),
      },
      throughput: globalMetrics.completed,
      retryRate: globalMetrics.started === 0 ? 0 : globalMetrics.retried / globalMetrics.started,
      failureRate: globalMetrics.started === 0 ? 0 : globalMetrics.failed / globalMetrics.started,
      deadLetterRate:
        globalMetrics.started === 0 ? 0 : globalMetrics.deadLettered / globalMetrics.started,
      processingDurationMs:
        globalMetrics.completed === 0
          ? 0
          : globalMetrics.totalProcessingDurationMs / globalMetrics.completed,
      workerHealth: queueNames.reduce<Record<string, 'IDLE' | 'HEALTHY' | 'DEGRADED'>>(
        (accumulator, queueName) => {
          const queueMetrics = metrics[queueName];
          accumulator[queueName] =
            queueMetrics.failed > queueMetrics.completed
              ? 'DEGRADED'
              : queueMetrics.started > 0
                ? 'HEALTHY'
                : 'IDLE';
          return accumulator;
        },
        {},
      ),
      metrics,
    };
  }
}
