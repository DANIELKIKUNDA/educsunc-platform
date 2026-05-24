import { UseCase } from '../../../../application/UseCase';
import { AuditSearchApplicationService } from '../../services/AuditSearchApplicationService';
import type { SearchAuditQuery } from '../../dto/queries/SearchAuditQuery';
import type { AuditEntryOutput } from '../../dto/outputs/AuditEntryOutput';

// Ce cas d'usage orchestre une operation applicative du BC Audit.
export class ConsulterAuditUseCase implements UseCase<SearchAuditQuery, AuditEntryOutput> {
  constructor(private readonly service: AuditSearchApplicationService) {}

  public async executer(entree: SearchAuditQuery): Promise<AuditEntryOutput> {
    return this.service.consulterAudit(entree);
  }
}
