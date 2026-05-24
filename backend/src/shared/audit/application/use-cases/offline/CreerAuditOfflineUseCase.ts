import { UseCase } from '../../../../application/UseCase';
import { AuditOfflineApplicationService } from '../../services/AuditOfflineApplicationService';
import type { CreateOfflineAuditEntryInput } from '../../dto/inputs/CreateOfflineAuditEntryInput';
import type { AuditEntryOutput } from '../../dto/outputs/AuditEntryOutput';

// Ce cas d'usage orchestre une operation applicative du BC Audit.
export class CreerAuditOfflineUseCase implements UseCase<CreateOfflineAuditEntryInput, AuditEntryOutput> {
  constructor(private readonly service: AuditOfflineApplicationService) {}

  public async executer(entree: CreateOfflineAuditEntryInput): Promise<AuditEntryOutput> {
    return this.service.creerAuditOffline(entree);
  }
}
