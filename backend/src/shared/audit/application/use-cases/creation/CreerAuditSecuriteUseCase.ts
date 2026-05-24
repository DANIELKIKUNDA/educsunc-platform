import { UseCase } from '../../../../application/UseCase';
import { AuditCreationApplicationService } from '../../services/AuditCreationApplicationService';
import type { CreateSecurityAuditInput } from '../../dto/inputs/CreateSecurityAuditInput';
import type { AuditEntryOutput } from '../../dto/outputs/AuditEntryOutput';

// Ce cas d'usage orchestre une operation applicative du BC Audit.
export class CreerAuditSecuriteUseCase implements UseCase<CreateSecurityAuditInput, AuditEntryOutput> {
  constructor(private readonly service: AuditCreationApplicationService) {}

  public async executer(entree: CreateSecurityAuditInput): Promise<AuditEntryOutput> {
    return this.service.creerAuditSecurite(entree);
  }
}
