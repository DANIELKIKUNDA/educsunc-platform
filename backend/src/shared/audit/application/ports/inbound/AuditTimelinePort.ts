// Ce port applicatif formalise une frontiere du BC Audit.
import type { AuditTimelineQuery } from '../../dto/queries';
import type { AuditTimelineOutput } from '../../dto/outputs';

// Ce port expose les timelines applicatives d audits.
export interface AuditTimelinePort {
  obtenirTimelineAudit(input: AuditTimelineQuery): Promise<AuditTimelineOutput>;
  obtenirTimelineActeur(input: AuditTimelineQuery): Promise<AuditTimelineOutput>;
  obtenirTimelineRessource(input: AuditTimelineQuery): Promise<AuditTimelineOutput>;
  obtenirTimelineWorkflow(input: AuditTimelineQuery): Promise<AuditTimelineOutput>;
}
