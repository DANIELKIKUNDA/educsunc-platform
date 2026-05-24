import { UseCase } from '../../../../application/UseCase';
import { AuditTimelineApplicationService } from '../../services/AuditTimelineApplicationService';
import type { AuditTimelineQuery } from '../../dto/queries/AuditTimelineQuery';
import type { AuditTimelineOutput } from '../../dto/outputs/AuditTimelineOutput';

// Ce cas d'usage orchestre une operation applicative du BC Audit.
export class ObtenirTimelineRessourceUseCase implements UseCase<AuditTimelineQuery, AuditTimelineOutput> {
  constructor(private readonly service: AuditTimelineApplicationService) {}

  public async executer(entree: AuditTimelineQuery): Promise<AuditTimelineOutput> {
    return this.service.obtenirTimelineRessource(entree);
  }
}
