// Ce contrat de lecture applicative expose une requete optimisee du BC Audit.
import type { AuditOfflineQuery } from '../../dto/queries/AuditOfflineQuery';
import type { RetryAuditReadModel } from '../../read-models/offline/RetryAuditReadModel';

export interface GetRetryAuditsQuery {
  executer(filtres: AuditOfflineQuery): Promise<RetryAuditReadModel>;
}
