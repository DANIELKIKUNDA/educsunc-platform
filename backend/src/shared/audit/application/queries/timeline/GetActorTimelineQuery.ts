// Ce contrat de lecture applicative expose une requete optimisee du BC Audit.
import type { AuditTimelineQuery } from '../../dto/queries/AuditTimelineQuery';
import type { ActorTimelineReadModel } from '../../read-models/timeline/ActorTimelineReadModel';

export interface GetActorTimelineQuery {
  executer(filtres: AuditTimelineQuery): Promise<ActorTimelineReadModel>;
}
