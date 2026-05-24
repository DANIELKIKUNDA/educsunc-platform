import { obtenirAuditWorkerQueueStore } from '../queues/AuditWorkerQueueStore';
import type { AuditWorkerJob } from '../WorkerTypes';

export class AuditWorkerScheduler {
  public planifier(job: AuditWorkerJob): void {
    obtenirAuditWorkerQueueStore().scheduled.push(job);
  }

  public recupererPlanifies(): AuditWorkerJob[] {
    return [...obtenirAuditWorkerQueueStore().scheduled];
  }
}
