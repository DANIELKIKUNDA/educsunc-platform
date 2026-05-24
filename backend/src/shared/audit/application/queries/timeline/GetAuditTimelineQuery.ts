// Ce contrat de lecture applicative expose une requete optimisee du BC Audit.
import type { AuditTimelineQuery } from '../../dto/queries/AuditTimelineQuery';
import type { AuditTimelineReadModel } from '../../read-models/timeline/AuditTimelineReadModel';

export interface GetAuditTimelineQuery {
  executer(filtres: AuditTimelineQuery): Promise<AuditTimelineReadModel>;
}
