import { UseCase } from '../../../../application/UseCase';
import { AuditCreationApplicationService } from '../../services/AuditCreationApplicationService';
import type { CreateSensitiveConsultationAuditInput } from '../../dto/inputs/CreateSensitiveConsultationAuditInput';
import type { AuditEntryOutput } from '../../dto/outputs/AuditEntryOutput';

// Ce cas d'usage orchestre une operation applicative du BC Audit.
export class CreerAuditConsultationSensibleUseCase implements UseCase<CreateSensitiveConsultationAuditInput, AuditEntryOutput> {
  constructor(private readonly service: AuditCreationApplicationService) {}

  public async executer(entree: CreateSensitiveConsultationAuditInput): Promise<AuditEntryOutput> {
    return this.service.creerAuditConsultationSensible(entree);
  }
}
