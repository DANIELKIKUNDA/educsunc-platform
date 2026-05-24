import { UseCase } from '../../../../application/UseCase';
import { AuditSecurityApplicationService } from '../../services/AuditSecurityApplicationService';
import type { AuditForensicQuery } from '../../dto/queries/AuditForensicQuery';
import type { AuditForensicOutput } from '../../dto/outputs/AuditForensicOutput';

// Ce cas d'usage orchestre une operation applicative du BC Audit.
export class InvestiguerIncidentSecuriteUseCase implements UseCase<AuditForensicQuery, AuditForensicOutput> {
  constructor(private readonly service: AuditSecurityApplicationService) {}

  public async executer(entree: AuditForensicQuery): Promise<AuditForensicOutput> {
    return this.service.investiguerIncidentSecurite(entree);
  }
}
