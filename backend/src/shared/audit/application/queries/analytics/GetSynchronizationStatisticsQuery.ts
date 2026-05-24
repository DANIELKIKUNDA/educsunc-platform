// Ce contrat de lecture applicative expose une requete optimisee du BC Audit.
import type { AuditAnalyticsQuery } from '../../dto/queries/AuditAnalyticsQuery';
import type { SynchronizationStatisticsReadModel } from '../../read-models/analytics/SynchronizationStatisticsReadModel';

export interface GetSynchronizationStatisticsQuery {
  executer(filtres: AuditAnalyticsQuery): Promise<SynchronizationStatisticsReadModel>;
}
