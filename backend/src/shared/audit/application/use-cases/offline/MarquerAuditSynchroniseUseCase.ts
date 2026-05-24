import { UseCase } from '../../../../application/UseCase';
import { AuditOfflineApplicationService } from '../../services/AuditOfflineApplicationService';
import type { OfflineAuditSyncStatusInput } from '../../dto/offline/OfflineAuditSyncStatusInput';
import type { AuditOfflineStatusOutput } from '../../dto/outputs/AuditOfflineStatusOutput';

// Ce cas d'usage orchestre une operation applicative du BC Audit.
export class MarquerAuditSynchroniseUseCase implements UseCase<OfflineAuditSyncStatusInput, AuditOfflineStatusOutput> {
  constructor(private readonly service: AuditOfflineApplicationService) {}

  public async executer(entree: OfflineAuditSyncStatusInput): Promise<AuditOfflineStatusOutput> {
    return this.service.marquerAuditSynchronise(entree);
  }
}
