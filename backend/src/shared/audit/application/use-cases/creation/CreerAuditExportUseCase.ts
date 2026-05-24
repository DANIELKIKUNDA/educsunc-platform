import { UseCase } from '../../../../application/UseCase';
import { AuditCreationApplicationService } from '../../services/AuditCreationApplicationService';
import type { CreateExportAuditInput } from '../../dto/inputs/CreateExportAuditInput';
import type { AuditEntryOutput } from '../../dto/outputs/AuditEntryOutput';

// Ce cas d'usage orchestre une operation applicative du BC Audit.
export class CreerAuditExportUseCase implements UseCase<CreateExportAuditInput, AuditEntryOutput> {
  constructor(private readonly service: AuditCreationApplicationService) {}

  public async executer(entree: CreateExportAuditInput): Promise<AuditEntryOutput> {
    return this.service.creerAuditExport(entree);
  }
}
