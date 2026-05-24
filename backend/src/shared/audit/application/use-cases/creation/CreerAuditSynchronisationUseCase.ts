import { UseCase } from '../../../../application/UseCase';
import { AuditCreationApplicationService } from '../../services/AuditCreationApplicationService';
import type { CreateSynchronizationAuditInput } from '../../dto/inputs/CreateSynchronizationAuditInput';
import type { AuditEntryOutput } from '../../dto/outputs/AuditEntryOutput';

// Ce cas d'usage orchestre une operation applicative du BC Audit.
export class CreerAuditSynchronisationUseCase implements UseCase<CreateSynchronizationAuditInput, AuditEntryOutput> {
  constructor(private readonly service: AuditCreationApplicationService) {}

  public async executer(entree: CreateSynchronizationAuditInput): Promise<AuditEntryOutput> {
    return this.service.creerAuditSynchronisation(entree);
  }
}
