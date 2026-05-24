import { AuditForensicApplicationService } from '../../services/AuditForensicApplicationService';
import type { AuditForensicQuery } from '../../dto/queries/AuditForensicQuery';
import type { AuditForensicOutput } from '../../dto/outputs/AuditForensicOutput';

// Cette saga orchestre un workflow long du BC Audit.
export class SynchronizationInvestigationSaga {
  constructor(private readonly auditForensicApplicationService: AuditForensicApplicationService) {}

  public async executer(payload: AuditForensicQuery): Promise<AuditForensicOutput> {
    return this.auditForensicApplicationService.lancerInvestigation(payload);
  }
}
