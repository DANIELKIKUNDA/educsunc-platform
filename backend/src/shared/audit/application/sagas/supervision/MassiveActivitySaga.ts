import { AuditAnalyticsApplicationService } from '../../services/AuditAnalyticsApplicationService';
import type { AuditAnalyticsQuery } from '../../dto/queries/AuditAnalyticsQuery';
import type { AuditAnalyticsOutput } from '../../dto/outputs/AuditAnalyticsOutput';

// Cette saga orchestre un workflow long du BC Audit.
export class MassiveActivitySaga {
  constructor(private readonly auditAnalyticsApplicationService: AuditAnalyticsApplicationService) {}

  public async executer(payload: AuditAnalyticsQuery): Promise<AuditAnalyticsOutput> {
    return this.auditAnalyticsApplicationService.obtenirVolumetrieAudit(payload);
  }
}
