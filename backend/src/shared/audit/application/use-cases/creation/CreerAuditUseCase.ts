import { UseCase } from '../../../../application/UseCase';
import { AuditCreationApplicationService } from '../../services/AuditCreationApplicationService';
import type { CreateAuditEntryInput } from '../../dto/inputs/CreateAuditEntryInput';
import type { AuditEntryOutput } from '../../dto/outputs/AuditEntryOutput';

// Ce cas d'usage orchestre une operation applicative du BC Audit.
export class CreerAuditUseCase implements UseCase<CreateAuditEntryInput, AuditEntryOutput> {
  constructor(private readonly service: AuditCreationApplicationService) {}

  public async executer(entree: CreateAuditEntryInput): Promise<AuditEntryOutput> {
    return this.service.creerAudit(entree);
  }
}
