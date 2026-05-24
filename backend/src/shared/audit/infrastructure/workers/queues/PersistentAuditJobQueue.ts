import { obtenirAuditWorkerQueueMetrics, obtenirAuditWorkerQueueStore } from './AuditWorkerQueueStore';
import type { AuditWorkerJob, AuditWorkerQueueName } from '../WorkerTypes';

export class PersistentAuditJobQueue {
  public enqueue(job: AuditWorkerJob): void {
    const queue = obtenirAuditWorkerQueueStore().queues.get(job.queue);
    queue?.push(job);
    obtenirAuditWorkerQueueMetrics(job.queue).enqueued += 1;
  }

  public dequeue(queueName: AuditWorkerQueueName): AuditWorkerJob | null {
    const queue = obtenirAuditWorkerQueueStore().queues.get(queueName);
    return queue && queue.length > 0 ? queue.shift() ?? null : null;
  }

  public list(queueName: AuditWorkerQueueName): AuditWorkerJob[] {
    return [...(obtenirAuditWorkerQueueStore().queues.get(queueName) ?? [])];
  }

  public size(queueName: AuditWorkerQueueName): number {
    return this.list(queueName).length;
  }
}
