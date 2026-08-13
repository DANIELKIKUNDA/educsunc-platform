import type { AuditExportQuery } from '../dto/queries/AuditExportQuery';
import type { AuditExportOutput } from '../dto/outputs/AuditExportOutput';
import type { AuditExportOperationsPort } from '../ports/exports/AuditExportOperationsPort';

// Ce service applicatif orchestre une famille de workflows Audit.
export class AuditExportApplicationService {
  public constructor(private readonly operations: AuditExportOperationsPort) {}

  public async exporterAudits(payload: AuditExportQuery): Promise<AuditExportOutput> {
    return this.operations.demander({ ...payload, categorieExport: 'AUDIT' });
  }
  public async exporterAuditForensic(payload: AuditExportQuery): Promise<AuditExportOutput> {
    return this.operations.demander({ ...payload, categorieExport: 'FORENSIC' });
  }
  public async exporterAuditsAnalytics(payload: AuditExportQuery): Promise<AuditExportOutput> {
    return this.operations.demander({ ...payload, categorieExport: 'ANALYTICS' });
  }
  public async exporterTimelineAudit(payload: AuditExportQuery): Promise<AuditExportOutput> {
    return this.operations.demander({ ...payload, categorieExport: 'AUDIT' });
  }
  public async exporterAuditsSecurite(payload: AuditExportQuery): Promise<AuditExportOutput> {
    return this.operations.demander({ ...payload, categorieExport: 'SECURITE' });
  }
}
