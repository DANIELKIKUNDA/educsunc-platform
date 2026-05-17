// Ce fichier contient un job technique minimal pour nettoyer les journaux d'audit.

import type { JobRunner } from '../../../../shared/infrastructure/jobs/JobRunner';

// Ce job declenche le nettoyage des journaux techniques ou d'audit.
export class AuditCleanupJob {
  constructor(private readonly jobRunner: JobRunner) {}

  // Cette methode execute le job de nettoyage d'audit.
  public async executer(charge?: Record<string, unknown>): Promise<void> {
    await this.jobRunner.executer('AUDIT_CLEANUP_JOB', charge);
  }
}
