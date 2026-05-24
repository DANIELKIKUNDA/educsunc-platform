// Ce contrat de lecture applicative expose une requete optimisee du BC Audit.
import type { AuditTimelineQuery } from '../../dto/queries/AuditTimelineQuery';
import type { ResourceTimelineReadModel } from '../../read-models/timeline/ResourceTimelineReadModel';

export interface GetResourceTimelineQuery {
  executer(filtres: AuditTimelineQuery): Promise<ResourceTimelineReadModel>;
}
