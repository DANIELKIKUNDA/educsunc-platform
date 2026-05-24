import { UseCase } from '../../../../application/UseCase';
import { AuditOfflineApplicationService } from '../../services/AuditOfflineApplicationService';
import type { OfflineAuditReplayInput } from '../../dto/offline/OfflineAuditReplayInput';
import type { AuditOfflineStatusOutput } from '../../dto/outputs/AuditOfflineStatusOutput';

// Ce cas d'usage orchestre une operation applicative du BC Audit.
export class RejouerAuditOfflineUseCase implements UseCase<OfflineAuditReplayInput, AuditOfflineStatusOutput> {
  constructor(private readonly service: AuditOfflineApplicationService) {}

  public async executer(entree: OfflineAuditReplayInput): Promise<AuditOfflineStatusOutput> {
    return this.service.rejouerAuditOffline(entree);
  }
}
