import { UseCase } from '../../../../application/UseCase';
import { AuditCreationApplicationService } from '../../services/AuditCreationApplicationService';
import type { CreatePedagogicalAuditInput } from '../../dto/inputs/CreatePedagogicalAuditInput';
import type { AuditEntryOutput } from '../../dto/outputs/AuditEntryOutput';

// Ce cas d'usage orchestre une operation applicative du BC Audit.
export class CreerAuditPedagogiqueUseCase implements UseCase<CreatePedagogicalAuditInput, AuditEntryOutput> {
  constructor(private readonly service: AuditCreationApplicationService) {}

  public async executer(entree: CreatePedagogicalAuditInput): Promise<AuditEntryOutput> {
    return this.service.creerAuditPedagogique(entree);
  }
}
