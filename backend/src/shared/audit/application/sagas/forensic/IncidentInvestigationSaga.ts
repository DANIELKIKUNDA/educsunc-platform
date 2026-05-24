import { AuditInvestigationApplicationService } from '../../services/AuditInvestigationApplicationService';
import type { AuditForensicQuery } from '../../dto/queries/AuditForensicQuery';
import type { AuditForensicOutput } from '../../dto/outputs/AuditForensicOutput';

// Cette saga orchestre un workflow long du BC Audit.
export class IncidentInvestigationSaga {
  constructor(private readonly auditInvestigationApplicationService: AuditInvestigationApplicationService) {}

  public async executer(payload: AuditForensicQuery): Promise<AuditForensicOutput> {
    return this.auditInvestigationApplicationService.investiguerIncident(payload);
  }
}
