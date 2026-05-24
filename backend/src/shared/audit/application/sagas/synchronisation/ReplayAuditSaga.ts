import { AuditReplayApplicationService } from '../../services/AuditReplayApplicationService';
import type { OfflineAuditReplayInput } from '../../dto/offline/OfflineAuditReplayInput';
import type { AuditOfflineStatusOutput } from '../../dto/outputs/AuditOfflineStatusOutput';

// Cette saga orchestre un workflow long du BC Audit.
export class ReplayAuditSaga {
  constructor(private readonly auditReplayApplicationService: AuditReplayApplicationService) {}

  public async executer(payload: OfflineAuditReplayInput): Promise<AuditOfflineStatusOutput> {
    return this.auditReplayApplicationService.rejouer(payload);
  }
}
