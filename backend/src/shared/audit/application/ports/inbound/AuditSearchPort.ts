// Ce port applicatif formalise une frontiere du BC Audit.
import type { SearchAuditQuery } from '../../dto/queries';
import type { AuditSearchResultOutput } from '../../dto/outputs';

// Ce port expose les recherches applicatives d audits.
export interface AuditSearchPort {
  rechercherAudits(input: SearchAuditQuery): Promise<AuditSearchResultOutput>;
  rechercherAuditsCritiques(input: SearchAuditQuery): Promise<AuditSearchResultOutput>;
  rechercherParActeur(input: SearchAuditQuery): Promise<AuditSearchResultOutput>;
  rechercherParRessource(input: SearchAuditQuery): Promise<AuditSearchResultOutput>;
  rechercherParCorrelation(input: SearchAuditQuery): Promise<AuditSearchResultOutput>;
}
