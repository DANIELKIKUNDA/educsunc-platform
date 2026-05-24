import { AuditInvestigationApplicationService } from '../../services/AuditInvestigationApplicationService';
import type { AuditForensicQuery } from '../../dto/queries/AuditForensicQuery';
import type { AuditForensicOutput } from '../../dto/outputs/AuditForensicOutput';

// Ce handler applique un flux applicatif Audit sans connaitre HTTP.
export class InvestigateIncidentHandler {
  constructor(private readonly auditInvestigationApplicationService: AuditInvestigationApplicationService) {}

  public async executer(payload: AuditForensicQuery): Promise<AuditForensicOutput> {
    return this.auditInvestigationApplicationService.investiguerIncident(payload);
  }
}
