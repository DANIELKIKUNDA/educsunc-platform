import { UseCase } from '../../../../application/UseCase';
import { AuditCreationApplicationService } from '../../services/AuditCreationApplicationService';
import type { CreateFinancialAuditInput } from '../../dto/inputs/CreateFinancialAuditInput';
import type { AuditEntryOutput } from '../../dto/outputs/AuditEntryOutput';

// Ce cas d'usage orchestre une operation applicative du BC Audit.
export class CreerAuditFinancierUseCase implements UseCase<CreateFinancialAuditInput, AuditEntryOutput> {
  constructor(private readonly service: AuditCreationApplicationService) {}

  public async executer(entree: CreateFinancialAuditInput): Promise<AuditEntryOutput> {
    return this.service.creerAuditFinancier(entree);
  }
}
