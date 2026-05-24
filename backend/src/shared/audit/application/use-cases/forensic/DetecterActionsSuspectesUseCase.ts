import { UseCase } from '../../../../application/UseCase';
import { AuditForensicApplicationService } from '../../services/AuditForensicApplicationService';
import type { AuditForensicQuery } from '../../dto/queries/AuditForensicQuery';
import type { AuditForensicOutput } from '../../dto/outputs/AuditForensicOutput';

// Ce cas d'usage orchestre une operation applicative du BC Audit.
export class DetecterActionsSuspectesUseCase implements UseCase<AuditForensicQuery, AuditForensicOutput> {
  constructor(private readonly service: AuditForensicApplicationService) {}

  public async executer(entree: AuditForensicQuery): Promise<AuditForensicOutput> {
    return this.service.detecterActionsSuspectes(entree);
  }
}
