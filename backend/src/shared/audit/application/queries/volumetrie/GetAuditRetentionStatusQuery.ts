// Ce contrat de lecture applicative expose une requete optimisee du BC Audit.
import type { AuditAnalyticsQuery } from '../../dto/queries/AuditAnalyticsQuery';
import type { AuditRetentionReadModel } from '../../read-models/volumetrie/AuditRetentionReadModel';

export interface GetAuditRetentionStatusQuery {
  executer(filtres: AuditAnalyticsQuery): Promise<AuditRetentionReadModel>;
}
