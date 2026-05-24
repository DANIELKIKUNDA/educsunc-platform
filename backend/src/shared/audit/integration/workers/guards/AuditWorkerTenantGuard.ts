import type { AuditWorkerJob } from '../../../infrastructure/workers';

// Ce guard interdit l execution worker sans tenant valide hors scope plateforme explicite.
export class AuditWorkerTenantGuard {
  public verifier(job: AuditWorkerJob): void {
    if (job.metadata.scope === 'PLATEFORME') {
      return;
    }

    if (!job.metadata.organisationId && !job.metadata.ecoleId) {
      throw new Error('Job worker Audit sans tenant valide refuse.');
    }
  }
}

