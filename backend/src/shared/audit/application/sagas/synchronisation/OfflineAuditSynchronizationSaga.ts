import { AuditOfflineApplicationService } from '../../services/AuditOfflineApplicationService';
import type { OfflineAuditSyncStatusInput } from '../../dto/offline/OfflineAuditSyncStatusInput';
import type { AuditOfflineStatusOutput } from '../../dto/outputs/AuditOfflineStatusOutput';

// Cette saga orchestre un workflow long du BC Audit.
export class OfflineAuditSynchronizationSaga {
  constructor(private readonly auditOfflineApplicationService: AuditOfflineApplicationService) {}

  public async executer(payload: OfflineAuditSyncStatusInput): Promise<AuditOfflineStatusOutput> {
    return this.auditOfflineApplicationService.marquerAuditSynchronise(payload);
  }
}
