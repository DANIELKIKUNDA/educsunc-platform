// Ce fichier contient un job technique minimal pour rejouer une synchronisation en echec.

import type { JobRunner } from '../../../../shared/infrastructure/jobs/JobRunner';

// Ce job declenche un rejet simple de synchronisation a partir d'un runner transverse.
export class SyncRetryJob {
  constructor(private readonly jobRunner: JobRunner) {}

  // Cette methode execute le job de nouvelle tentative.
  public async executer(charge?: Record<string, unknown>): Promise<void> {
    await this.jobRunner.executer('SYNC_RETRY_JOB', charge);
  }
}
