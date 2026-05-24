import { PersistentAuditJobQueue } from '../queues/PersistentAuditJobQueue';
import type { AuditWorkerJob } from '../WorkerTypes';

export class AuditJobDispatcher {
  public constructor(
    private readonly queue: PersistentAuditJobQueue = new PersistentAuditJobQueue(),
  ) {}

  public dispatch(job: AuditWorkerJob): void {
    this.queue.enqueue(job);
  }
}
