import type { SearchAuditQuery } from '../dto/queries/SearchAuditQuery';
import type { AuditSearchResultOutput } from '../dto/outputs/AuditSearchResultOutput';
import type { AuditAnalyticsOutput } from '../dto/outputs/AuditAnalyticsOutput';
import type { AuditRetentionOperationsPort } from '../ports/outbound/AuditRetentionOperationsPort';

// Ce service applicatif orchestre une famille de workflows Audit.
export class AuditRetentionApplicationService {
  public constructor(private readonly operations: AuditRetentionOperationsPort) {}

  public async preparerArchivageAudit(payload: SearchAuditQuery): Promise<AuditAnalyticsOutput> {
    return this.operations.preparer(payload);
  }
  public async archiverAudits(payload: SearchAuditQuery): Promise<AuditAnalyticsOutput> {
    return this.operations.archiver(payload);
  }
  public async consulterArchivesAudit(payload: SearchAuditQuery): Promise<AuditSearchResultOutput> {
    return this.operations.consulter(payload);
  }

  public async apercuPurge(payload: SearchAuditQuery): Promise<AuditAnalyticsOutput> {
    return this.operations.apercuPurge(payload);
  }
}
