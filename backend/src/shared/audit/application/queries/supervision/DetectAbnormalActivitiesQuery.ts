// Ce contrat de lecture applicative expose une requete optimisee du BC Audit.
import type { AuditAnalyticsQuery } from '../../dto/queries/AuditAnalyticsQuery';
import type { AbnormalActivityReadModel } from '../../read-models/supervision/AbnormalActivityReadModel';

export interface DetectAbnormalActivitiesQuery {
  executer(filtres: AuditAnalyticsQuery): Promise<AbnormalActivityReadModel>;
}
