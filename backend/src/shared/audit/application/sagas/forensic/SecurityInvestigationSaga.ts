import { AuditSecurityApplicationService } from '../../services/AuditSecurityApplicationService';
import type { AuditForensicQuery } from '../../dto/queries/AuditForensicQuery';
import type { AuditForensicOutput } from '../../dto/outputs/AuditForensicOutput';

// Cette saga orchestre un workflow long du BC Audit.
export class SecurityInvestigationSaga {
  constructor(private readonly auditSecurityApplicationService: AuditSecurityApplicationService) {}

  public async executer(payload: AuditForensicQuery): Promise<AuditForensicOutput> {
    return this.auditSecurityApplicationService.investiguerIncidentSecurite(payload);
  }
}
