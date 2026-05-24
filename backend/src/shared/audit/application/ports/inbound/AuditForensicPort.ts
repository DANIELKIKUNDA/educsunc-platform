// Ce port applicatif formalise une frontiere du BC Audit.
import type { AuditForensicQuery } from '../../dto/queries';
import type { AuditForensicOutput } from '../../dto/outputs';

// Ce port expose les investigations forensic applicatives.
export interface AuditForensicPort {
  lancerInvestigation(input: AuditForensicQuery): Promise<AuditForensicOutput>;
  reconstruireWorkflow(input: AuditForensicQuery): Promise<AuditForensicOutput>;
  investiguerIncidentSecurite(input: AuditForensicQuery): Promise<AuditForensicOutput>;
  investiguerExportMassif(input: AuditForensicQuery): Promise<AuditForensicOutput>;
  detecterActionsSuspectes(input: AuditForensicQuery): Promise<AuditForensicOutput>;
}
