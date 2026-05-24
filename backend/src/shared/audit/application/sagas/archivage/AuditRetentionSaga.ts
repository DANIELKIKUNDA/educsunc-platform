import { AuditRetentionApplicationService } from '../../services/AuditRetentionApplicationService';
import type { SearchAuditQuery } from '../../dto/queries/SearchAuditQuery';
import type { AuditAnalyticsOutput } from '../../dto/outputs/AuditAnalyticsOutput';

// Cette saga orchestre un workflow long du BC Audit.
export class AuditRetentionSaga {
  constructor(private readonly auditRetentionApplicationService: AuditRetentionApplicationService) {}

  public async executer(payload: SearchAuditQuery): Promise<AuditAnalyticsOutput> {
    return this.auditRetentionApplicationService.preparerArchivageAudit(payload);
  }
}
