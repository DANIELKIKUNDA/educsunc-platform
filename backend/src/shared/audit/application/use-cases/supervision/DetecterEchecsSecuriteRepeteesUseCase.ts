import { UseCase } from '../../../../application/UseCase';
import { AuditSecurityApplicationService } from '../../services/AuditSecurityApplicationService';
import type { SearchAuditQuery } from '../../dto/queries/SearchAuditQuery';
import type { AuditAnalyticsOutput } from '../../dto/outputs/AuditAnalyticsOutput';

// Ce cas d'usage orchestre une operation applicative du BC Audit.
export class DetecterEchecsSecuriteRepeteesUseCase implements UseCase<SearchAuditQuery, AuditAnalyticsOutput> {
  constructor(private readonly service: AuditSecurityApplicationService) {}

  public async executer(entree: SearchAuditQuery): Promise<AuditAnalyticsOutput> {
    return this.service.detecterEchecsSecuriteRepetees(entree);
  }
}
