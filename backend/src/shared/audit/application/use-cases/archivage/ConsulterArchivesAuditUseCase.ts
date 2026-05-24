import { UseCase } from '../../../../application/UseCase';
import { AuditRetentionApplicationService } from '../../services/AuditRetentionApplicationService';
import type { SearchAuditQuery } from '../../dto/queries/SearchAuditQuery';
import type { AuditSearchResultOutput } from '../../dto/outputs/AuditSearchResultOutput';

// Ce cas d'usage orchestre une operation applicative du BC Audit.
export class ConsulterArchivesAuditUseCase implements UseCase<SearchAuditQuery, AuditSearchResultOutput> {
  constructor(private readonly service: AuditRetentionApplicationService) {}

  public async executer(entree: SearchAuditQuery): Promise<AuditSearchResultOutput> {
    return this.service.consulterArchivesAudit(entree);
  }
}
