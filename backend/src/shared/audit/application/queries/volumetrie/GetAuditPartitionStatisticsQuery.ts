// Ce contrat de lecture applicative expose une requete optimisee du BC Audit.
import type { AuditAnalyticsQuery } from '../../dto/queries/AuditAnalyticsQuery';
import type { AuditPartitionStatisticsReadModel } from '../../read-models/volumetrie/AuditPartitionStatisticsReadModel';

export interface GetAuditPartitionStatisticsQuery {
  executer(filtres: AuditAnalyticsQuery): Promise<AuditPartitionStatisticsReadModel>;
}
