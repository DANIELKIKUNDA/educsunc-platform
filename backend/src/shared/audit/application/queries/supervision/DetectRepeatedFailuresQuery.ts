// Ce contrat de lecture applicative expose une requete optimisee du BC Audit.
import type { AuditAnalyticsQuery } from '../../dto/queries/AuditAnalyticsQuery';
import type { SecurityAlertReadModel } from '../../read-models/supervision/SecurityAlertReadModel';

export interface DetectRepeatedFailuresQuery {
  executer(filtres: AuditAnalyticsQuery): Promise<SecurityAlertReadModel>;
}
