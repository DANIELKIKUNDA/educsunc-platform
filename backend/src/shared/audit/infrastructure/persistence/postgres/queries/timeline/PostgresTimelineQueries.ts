import type {
  GetAuditTimelineQuery,
} from '../../../../../application/queries/timeline';
import type { AuditTimelineQuery } from '../../../../../application/dto/queries/AuditTimelineQuery';
import type { ActorTimelineReadModel } from '../../../../../application/read-models/timeline/ActorTimelineReadModel';
import type { AuditTimelineReadModel } from '../../../../../application/read-models/timeline/AuditTimelineReadModel';
import type { ResourceTimelineReadModel } from '../../../../../application/read-models/timeline/ResourceTimelineReadModel';
import type { WorkflowTimelineReadModel } from '../../../../../application/read-models/timeline/WorkflowTimelineReadModel';
import { versPagination, versTimelineReadModel } from '../query-helpers';

export class PostgresTimelineQueries implements
  GetAuditTimelineQuery {
  public constructor(private readonly deps: Pick<import('../query-helpers').AuditQueryDependencies, 'timelineRepository'>) {}

  public async executer(filtres: AuditTimelineQuery): Promise<AuditTimelineReadModel> {
    const correlation = filtres.correlationId ?? filtres.workflowId ?? '';
    const resultat = correlation
      ? await this.deps.timelineRepository.listerTimelineWorkflow(correlation, versPagination({}))
      : filtres.acteurId
        ? await this.deps.timelineRepository.listerTimelineUtilisateur(filtres.acteurId, versPagination({}))
        : filtres.ressourceId
          ? await this.deps.timelineRepository.listerTimelineRessource(filtres.ressourceId, versPagination({}))
          : await this.deps.timelineRepository.listerTimelineTenant({}, versPagination({}));
    return versTimelineReadModel(resultat.resultats, correlation || undefined);
  }

  public async executerActeur(filtres: AuditTimelineQuery): Promise<ActorTimelineReadModel> {
    const resultat = await this.deps.timelineRepository.listerTimelineUtilisateur(filtres.acteurId ?? '', versPagination({}));
    return { acteurId: filtres.acteurId, items: versTimelineReadModel(resultat.resultats).items };
  }

  public async executerRessource(filtres: AuditTimelineQuery): Promise<ResourceTimelineReadModel> {
    const resultat = await this.deps.timelineRepository.listerTimelineRessource(filtres.ressourceId ?? '', versPagination({}));
    return { ressourceId: filtres.ressourceId, items: versTimelineReadModel(resultat.resultats).items };
  }

  public async executerSynchronisation(filtres: AuditTimelineQuery): Promise<AuditTimelineReadModel> {
    const resultat = await this.deps.timelineRepository.listerTimelineSynchronisation({}, versPagination({}));
    return versTimelineReadModel(resultat.resultats, filtres.correlationId);
  }

  public async executerWorkflow(filtres: AuditTimelineQuery): Promise<WorkflowTimelineReadModel> {
    const workflowId = filtres.workflowId ?? filtres.correlationId ?? '';
    const resultat = await this.deps.timelineRepository.listerTimelineWorkflow(workflowId, versPagination({}));
    return { workflowId, items: versTimelineReadModel(resultat.resultats, workflowId).items };
  }
}
