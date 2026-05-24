// Ce contrat de lecture applicative expose une requete optimisee du BC Audit.
import type { AuditOfflineQuery } from '../../dto/queries/AuditOfflineQuery';
import type { ReplayAuditReadModel } from '../../read-models/offline/ReplayAuditReadModel';

export interface GetReplayAuditsQuery {
  executer(filtres: AuditOfflineQuery): Promise<ReplayAuditReadModel>;
}
