import { UseCase } from '../../../../application/UseCase';
import { AuditSearchApplicationService } from '../../services/AuditSearchApplicationService';
import type { SearchAuditQuery } from '../../dto/queries/SearchAuditQuery';
import type { AuditSearchResultOutput } from '../../dto/outputs/AuditSearchResultOutput';

// Ce cas d'usage orchestre une operation applicative du BC Audit.
export class RechercherAuditsParActeurUseCase implements UseCase<SearchAuditQuery, AuditSearchResultOutput> {
  constructor(private readonly service: AuditSearchApplicationService) {}

  public async executer(entree: SearchAuditQuery): Promise<AuditSearchResultOutput> {
    return this.service.rechercherParActeur(entree);
  }
}
