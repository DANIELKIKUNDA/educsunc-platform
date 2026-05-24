// Ce contrat de lecture applicative expose une requete optimisee du BC Audit.
import type { SearchAuditQuery } from '../../dto/queries/SearchAuditQuery';
import type { AuditHistoryReadModel } from '../../read-models/consultation/AuditHistoryReadModel';

export interface GetAuditHistoryQuery {
  executer(filtres: SearchAuditQuery): Promise<AuditHistoryReadModel>;
}
