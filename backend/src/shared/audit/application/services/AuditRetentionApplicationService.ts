import type { SearchAuditQuery } from '../dto/queries/SearchAuditQuery';
import type { AuditSearchResultOutput } from '../dto/outputs/AuditSearchResultOutput';
import type { AuditAnalyticsOutput } from '../dto/outputs/AuditAnalyticsOutput';

// Ce service applicatif orchestre une famille de workflows Audit.
export class AuditRetentionApplicationService {
  public async preparerArchivageAudit(payload: SearchAuditQuery): Promise<AuditAnalyticsOutput> {
    return { periode: undefined, valeurs: { candidatsArchivage: 0 }, compteurs: { organisationId: payload.organisationId ? 1 : 0 } };
  }
  public async archiverAudits(payload: SearchAuditQuery): Promise<AuditAnalyticsOutput> {
    return { periode: undefined, valeurs: { archives: 0 }, compteurs: { ecoleId: payload.ecoleId ? 1 : 0 } };
  }
  public async consulterArchivesAudit(payload: SearchAuditQuery): Promise<AuditSearchResultOutput> {
    return { total: 0, page: payload.page ?? 1, taillePage: payload.taillePage ?? 25, totalPages: 0, hasNextPage: false, items: [], pagination: { page: payload.page ?? 1, taille: payload.taillePage ?? 25, total: 0, totalPages: 0, hasNextPage: false } };
  }
}
