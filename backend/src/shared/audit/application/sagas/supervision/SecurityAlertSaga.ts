import { AuditSecurityApplicationService } from '../../services/AuditSecurityApplicationService';
import type { SearchAuditQuery } from '../../dto/queries/SearchAuditQuery';
import type { AuditAnalyticsOutput } from '../../dto/outputs/AuditAnalyticsOutput';

// Cette saga orchestre un workflow long du BC Audit.
export class SecurityAlertSaga {
  constructor(private readonly auditSecurityApplicationService: AuditSecurityApplicationService) {}

  public async executer(payload: SearchAuditQuery): Promise<AuditAnalyticsOutput> {
    return this.auditSecurityApplicationService.detecterEchecsSecuriteRepetees(payload);
  }
}
