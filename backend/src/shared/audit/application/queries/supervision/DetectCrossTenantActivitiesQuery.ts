// Ce contrat de lecture applicative expose une requete optimisee du BC Audit.
import type { AuditAnalyticsQuery } from '../../dto/queries/AuditAnalyticsQuery';
import type { CrossTenantAlertReadModel } from '../../read-models/supervision/CrossTenantAlertReadModel';

export interface DetectCrossTenantActivitiesQuery {
  executer(filtres: AuditAnalyticsQuery): Promise<CrossTenantAlertReadModel>;
}
