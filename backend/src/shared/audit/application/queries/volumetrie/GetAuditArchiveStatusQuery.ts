// Ce contrat de lecture applicative expose une requete optimisee du BC Audit.
import type { AuditAnalyticsQuery } from '../../dto/queries/AuditAnalyticsQuery';
import type { AuditArchiveStatusReadModel } from '../../read-models/consultation/AuditArchiveStatusReadModel';

export interface GetAuditArchiveStatusQuery {
  executer(filtres: AuditAnalyticsQuery): Promise<AuditArchiveStatusReadModel>;
}
