// Ce contrat de lecture applicative expose une requete optimisee du BC Audit.
import type { AuditTimelineQuery } from '../../dto/queries/AuditTimelineQuery';
import type { WorkflowTimelineReadModel } from '../../read-models/timeline/WorkflowTimelineReadModel';

export interface GetWorkflowTimelineQuery {
  executer(filtres: AuditTimelineQuery): Promise<WorkflowTimelineReadModel>;
}
