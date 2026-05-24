// Ce contrat de lecture applicative expose une requete optimisee du BC Audit.
import type { AuditAnalyticsQuery } from '../../dto/queries/AuditAnalyticsQuery';
import type { SecurityAuditStatisticsReadModel } from '../../read-models/analytics/SecurityAuditStatisticsReadModel';

export interface GetSecurityAuditStatisticsQuery {
  executer(filtres: AuditAnalyticsQuery): Promise<SecurityAuditStatisticsReadModel>;
}
