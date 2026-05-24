import { InvestiguerIncidentSecuriteUseCase } from '../../use-cases/forensic/InvestiguerIncidentSecuriteUseCase';
import type { AuditForensicQuery } from '../../dto/queries/AuditForensicQuery';
import type { AuditForensicOutput } from '../../dto/outputs/AuditForensicOutput';

// Ce handler applique un flux applicatif Audit sans connaitre HTTP.
export class InvestigateSecurityHandler {
  constructor(private readonly investiguerIncidentSecuriteUseCase: InvestiguerIncidentSecuriteUseCase) {}

  public async executer(payload: AuditForensicQuery): Promise<AuditForensicOutput> {
    return this.investiguerIncidentSecuriteUseCase.executer(payload);
  }
}
