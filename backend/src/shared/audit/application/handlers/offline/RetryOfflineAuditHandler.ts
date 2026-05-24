import { AuditReplayApplicationService } from '../../services/AuditReplayApplicationService';
import type { OfflineAuditRetryInput } from '../../dto/offline/OfflineAuditRetryInput';
import type { AuditOfflineStatusOutput } from '../../dto/outputs/AuditOfflineStatusOutput';

// Ce handler applique un flux applicatif Audit sans connaitre HTTP.
export class RetryOfflineAuditHandler {
  constructor(private readonly auditReplayApplicationService: AuditReplayApplicationService) {}

  public async executer(payload: OfflineAuditRetryInput): Promise<AuditOfflineStatusOutput> {
    return this.auditReplayApplicationService.retry(payload);
  }
}
