import { AuditReplayApplicationService } from '../../services/AuditReplayApplicationService';
import type { OfflineAuditRetryInput } from '../../dto/offline/OfflineAuditRetryInput';
import type { AuditOfflineStatusOutput } from '../../dto/outputs/AuditOfflineStatusOutput';

// Cette saga orchestre un workflow long du BC Audit.
export class RetryAuditSaga {
  constructor(private readonly auditReplayApplicationService: AuditReplayApplicationService) {}

  public async executer(payload: OfflineAuditRetryInput): Promise<AuditOfflineStatusOutput> {
    return this.auditReplayApplicationService.retry(payload);
  }
}
