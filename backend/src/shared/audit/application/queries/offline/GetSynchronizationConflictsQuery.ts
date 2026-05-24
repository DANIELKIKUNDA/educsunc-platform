// Ce contrat de lecture applicative expose une requete optimisee du BC Audit.
import type { AuditOfflineQuery } from '../../dto/queries/AuditOfflineQuery';
import type { SynchronizationConflictReadModel } from '../../read-models/offline/SynchronizationConflictReadModel';

export interface GetSynchronizationConflictsQuery {
  executer(filtres: AuditOfflineQuery): Promise<SynchronizationConflictReadModel>;
}
