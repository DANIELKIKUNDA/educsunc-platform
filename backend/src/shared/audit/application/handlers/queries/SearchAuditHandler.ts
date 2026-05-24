import { RechercherAuditsUseCase } from '../../use-cases/recherche/RechercherAuditsUseCase';
import type { SearchAuditQuery } from '../../dto/queries/SearchAuditQuery';
import type { AuditSearchResultOutput } from '../../dto/outputs/AuditSearchResultOutput';

// Ce handler applique un flux applicatif Audit sans connaitre HTTP.
export class SearchAuditHandler {
  constructor(private readonly rechercherAuditsUseCase: RechercherAuditsUseCase) {}

  public async executer(payload: SearchAuditQuery): Promise<AuditSearchResultOutput> {
    return this.rechercherAuditsUseCase.executer(payload);
  }
}
