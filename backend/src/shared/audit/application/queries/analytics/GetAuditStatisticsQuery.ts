// Ce contrat de lecture applicative expose une requete optimisee du BC Audit.
import type { AuditAnalyticsQuery } from '../../dto/queries/AuditAnalyticsQuery';
import type { AuditStatisticsReadModel } from '../../read-models/analytics/AuditStatisticsReadModel';

export interface GetAuditStatisticsQuery {
  executer(filtres: AuditAnalyticsQuery): Promise<AuditStatisticsReadModel>;
}
