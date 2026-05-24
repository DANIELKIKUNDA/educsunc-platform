import { UseCase } from '../../../../application/UseCase';
import { AuditInvestigationApplicationService } from '../../services/AuditInvestigationApplicationService';
import type { AuditForensicQuery } from '../../dto/queries/AuditForensicQuery';
import type { AuditForensicOutput } from '../../dto/outputs/AuditForensicOutput';

// Ce cas d'usage orchestre une operation applicative du BC Audit.
export class InvestiguerExportMassifUseCase implements UseCase<AuditForensicQuery, AuditForensicOutput> {
  constructor(private readonly service: AuditInvestigationApplicationService) {}

  public async executer(entree: AuditForensicQuery): Promise<AuditForensicOutput> {
    return this.service.investiguerExportMassif(entree);
  }
}
