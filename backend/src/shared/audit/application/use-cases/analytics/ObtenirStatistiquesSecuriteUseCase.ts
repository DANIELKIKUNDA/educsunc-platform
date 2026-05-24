import { UseCase } from '../../../../application/UseCase';
import { AuditAnalyticsApplicationService } from '../../services/AuditAnalyticsApplicationService';
import type { AuditAnalyticsQuery } from '../../dto/queries/AuditAnalyticsQuery';
import type { AuditAnalyticsOutput } from '../../dto/outputs/AuditAnalyticsOutput';

// Ce cas d'usage orchestre une operation applicative du BC Audit.
export class ObtenirStatistiquesSecuriteUseCase implements UseCase<AuditAnalyticsQuery, AuditAnalyticsOutput> {
  constructor(private readonly service: AuditAnalyticsApplicationService) {}

  public async executer(entree: AuditAnalyticsQuery): Promise<AuditAnalyticsOutput> {
    return this.service.obtenirStatistiquesSecurite(entree);
  }
}
