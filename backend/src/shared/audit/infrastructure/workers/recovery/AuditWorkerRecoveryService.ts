import { PersistentAuditJobQueue } from '../queues/PersistentAuditJobQueue';
import { AuditWorkerDeadLetterQueue } from '../dead-letter/AuditWorkerDeadLetterQueue';
import { AuditWorkerScheduler } from '../schedulers/AuditWorkerScheduler';

export class AuditWorkerRecoveryService {
  public constructor(
    private readonly queue: PersistentAuditJobQueue = new PersistentAuditJobQueue(),
    private readonly deadLetter: AuditWorkerDeadLetterQueue = new AuditWorkerDeadLetterQueue(),
    private readonly scheduler: AuditWorkerScheduler = new AuditWorkerScheduler(),
  ) {}

  public snapshot() {
    return {
      projections: this.queue.list('PROJECTIONS'),
      exports: this.queue.list('EXPORTS'),
      synchronization: this.queue.list('SYNCHRONIZATION'),
      analytics: this.queue.list('ANALYTICS'),
      retention: this.queue.list('RETENTION'),
      monitoring: this.queue.list('MONITORING'),
      forensic: this.queue.list('FORENSIC'),
      scheduled: this.scheduler.recupererPlanifies(),
      deadLetters: this.deadLetter.lister(),
    };
  }
}
