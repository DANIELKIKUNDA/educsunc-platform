// Ce fichier contient un job technique minimal pour nettoyer les cles d'idempotence expirees.

import type { JobRunner } from '../../../../shared/infrastructure/jobs/JobRunner';

// Ce job declenche le nettoyage des cles d'idempotence.
export class CleanupIdempotencyJob {
  constructor(private readonly jobRunner: JobRunner) {}

  // Cette methode execute le job de nettoyage.
  public async executer(charge?: Record<string, unknown>): Promise<void> {
    await this.jobRunner.executer('CLEANUP_IDEMPOTENCY_JOB', charge);
  }
}
