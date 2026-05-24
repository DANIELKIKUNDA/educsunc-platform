import { UseCase } from '../../../../application/UseCase';
import { AuditOfflineApplicationService } from '../../services/AuditOfflineApplicationService';
import type { OfflineAuditConflictInput } from '../../dto/offline/OfflineAuditConflictInput';
import type { AuditOfflineStatusOutput } from '../../dto/outputs/AuditOfflineStatusOutput';

// Ce cas d'usage orchestre une operation applicative du BC Audit.
export class ResoudreConflitAuditUseCase implements UseCase<OfflineAuditConflictInput, AuditOfflineStatusOutput> {
  constructor(private readonly service: AuditOfflineApplicationService) {}

  public async executer(entree: OfflineAuditConflictInput): Promise<AuditOfflineStatusOutput> {
    return this.service.resoudreConflitAudit(entree);
  }
}
