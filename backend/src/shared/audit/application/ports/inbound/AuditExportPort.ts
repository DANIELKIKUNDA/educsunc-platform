// Ce port applicatif formalise une frontiere du BC Audit.
import type { AuditExportQuery } from '../../dto/queries';
import type { AuditExportOutput } from '../../dto/outputs';

// Ce port expose les exports applicatifs d audits.
export interface AuditExportPort {
  exporterAudits(input: AuditExportQuery): Promise<AuditExportOutput>;
  exporterForensic(input: AuditExportQuery): Promise<AuditExportOutput>;
  exporterTimeline(input: AuditExportQuery): Promise<AuditExportOutput>;
  exporterAuditsSecurite(input: AuditExportQuery): Promise<AuditExportOutput>;
}
