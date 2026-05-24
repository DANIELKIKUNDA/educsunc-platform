import { UseCase } from '../../../../application/UseCase';
import { AuditRetentionApplicationService } from '../../services/AuditRetentionApplicationService';
import type { SearchAuditQuery } from '../../dto/queries/SearchAuditQuery';
import type { AuditAnalyticsOutput } from '../../dto/outputs/AuditAnalyticsOutput';

// Ce cas d'usage orchestre une operation applicative du BC Audit.
export class PreparerArchivageAuditUseCase implements UseCase<SearchAuditQuery, AuditAnalyticsOutput> {
  constructor(private readonly service: AuditRetentionApplicationService) {}

  public async executer(entree: SearchAuditQuery): Promise<AuditAnalyticsOutput> {
    return this.service.preparerArchivageAudit(entree);
  }
}
