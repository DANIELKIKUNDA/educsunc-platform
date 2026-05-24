// Ce contrat de lecture applicative expose une requete optimisee du BC Audit.
import type { SearchAuditQuery } from '../../dto/queries/SearchAuditQuery';
import type { AuditSearchReadModel } from '../../read-models/search/AuditSearchReadModel';

export interface SearchCriticalAuditsQuery {
  executer(filtres: SearchAuditQuery): Promise<AuditSearchReadModel>;
}
