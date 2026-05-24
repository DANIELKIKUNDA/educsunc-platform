import { AuditOfflineApplicationService } from '../../services/AuditOfflineApplicationService';
import type { OfflineAuditConflictInput } from '../../dto/offline/OfflineAuditConflictInput';
import type { AuditOfflineStatusOutput } from '../../dto/outputs/AuditOfflineStatusOutput';

// Cette saga orchestre un workflow long du BC Audit.
export class SynchronizationConflictSaga {
  constructor(private readonly auditOfflineApplicationService: AuditOfflineApplicationService) {}

  public async executer(payload: OfflineAuditConflictInput): Promise<AuditOfflineStatusOutput> {
    return this.auditOfflineApplicationService.resoudreConflitAudit(payload);
  }
}
