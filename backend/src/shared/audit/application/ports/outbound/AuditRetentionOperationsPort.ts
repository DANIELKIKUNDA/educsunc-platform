import type { SearchAuditQuery } from '../../dto/queries/SearchAuditQuery';
import type { AuditAnalyticsOutput } from '../../dto/outputs/AuditAnalyticsOutput';
import type { AuditSearchResultOutput } from '../../dto/outputs/AuditSearchResultOutput';

export interface AuditRetentionOperationsPort {
  preparer(payload: SearchAuditQuery): Promise<AuditAnalyticsOutput>;
  archiver(payload: SearchAuditQuery): Promise<AuditAnalyticsOutput>;
  consulter(payload: SearchAuditQuery): Promise<AuditSearchResultOutput>;
  apercuPurge(payload: SearchAuditQuery): Promise<AuditAnalyticsOutput>;
}
