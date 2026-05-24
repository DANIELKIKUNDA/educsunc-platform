// Ce contrat de lecture applicative expose une requete optimisee du BC Audit.
import type { AuditAnalyticsQuery } from '../../dto/queries/AuditAnalyticsQuery';
import type { AuditVolumeReadModel } from '../../read-models/analytics/AuditVolumeReadModel';

export interface GetAuditVolumeQuery {
  executer(filtres: AuditAnalyticsQuery): Promise<AuditVolumeReadModel>;
}
