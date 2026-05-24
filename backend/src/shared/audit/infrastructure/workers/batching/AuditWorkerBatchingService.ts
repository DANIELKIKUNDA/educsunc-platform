import type { AuditWorkerJob } from '../WorkerTypes';

export class AuditWorkerBatchingService {
  public decouper(jobs: AuditWorkerJob[], tailleLot = 100): AuditWorkerJob[][] {
    const lots: AuditWorkerJob[][] = [];
    for (let index = 0; index < jobs.length; index += tailleLot) {
      lots.push(jobs.slice(index, index + tailleLot));
    }
    return lots;
  }
}
