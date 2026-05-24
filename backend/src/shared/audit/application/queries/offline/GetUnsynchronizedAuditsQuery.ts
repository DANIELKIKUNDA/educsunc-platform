// Ce contrat de lecture applicative expose une requete optimisee du BC Audit.
import type { AuditOfflineQuery } from '../../dto/queries/AuditOfflineQuery';
import type { OfflineAuditReadModel } from '../../read-models/offline/OfflineAuditReadModel';

export interface GetUnsynchronizedAuditsQuery {
  executer(filtres: AuditOfflineQuery): Promise<OfflineAuditReadModel>;
}
