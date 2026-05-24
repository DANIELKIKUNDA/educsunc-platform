// Ce contrat de lecture applicative expose une requete optimisee du BC Audit.
import type { AuditAnalyticsQuery } from '../../dto/queries/AuditAnalyticsQuery';
import type { ExportStatisticsReadModel } from '../../read-models/analytics/ExportStatisticsReadModel';

export interface GetExportStatisticsQuery {
  executer(filtres: AuditAnalyticsQuery): Promise<ExportStatisticsReadModel>;
}
