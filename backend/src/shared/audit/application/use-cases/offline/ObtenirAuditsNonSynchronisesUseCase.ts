import { UseCase } from '../../../../application/UseCase';
import { AuditOfflineApplicationService } from '../../services/AuditOfflineApplicationService';
import type { AuditOfflineStatusOutput } from '../../dto/outputs/AuditOfflineStatusOutput';

// Ce cas d'usage orchestre une operation applicative du BC Audit.
export class ObtenirAuditsNonSynchronisesUseCase implements UseCase<void, AuditOfflineStatusOutput> {
  constructor(private readonly service: AuditOfflineApplicationService) {}

  public async executer(): Promise<AuditOfflineStatusOutput> {
    return this.service.obtenirAuditsNonSynchronises();
  }
}
