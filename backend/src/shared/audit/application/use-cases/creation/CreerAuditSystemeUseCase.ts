import { UseCase } from '../../../../application/UseCase';
import { AuditCreationApplicationService } from '../../services/AuditCreationApplicationService';
import type { CreateSystemAuditInput } from '../../dto/inputs/CreateSystemAuditInput';
import type { AuditEntryOutput } from '../../dto/outputs/AuditEntryOutput';

// Ce cas d'usage orchestre une operation applicative du BC Audit.
export class CreerAuditSystemeUseCase implements UseCase<CreateSystemAuditInput, AuditEntryOutput> {
  constructor(private readonly service: AuditCreationApplicationService) {}

  public async executer(entree: CreateSystemAuditInput): Promise<AuditEntryOutput> {
    return this.service.creerAuditSysteme(entree);
  }
}
