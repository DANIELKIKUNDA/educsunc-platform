// Ce contrat de lecture applicative expose une requete optimisee du BC Audit.
import type { SearchAuditQuery } from '../../dto/queries/SearchAuditQuery';
import type { AuditEntryDetailsReadModel } from '../../read-models/consultation/AuditEntryDetailsReadModel';

export interface GetAuditEntryQuery {
  executer(filtres: SearchAuditQuery): Promise<AuditEntryDetailsReadModel>;
}
