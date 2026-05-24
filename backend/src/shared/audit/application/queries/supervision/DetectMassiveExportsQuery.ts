// Ce contrat de lecture applicative expose une requete optimisee du BC Audit.
import type { AuditAnalyticsQuery } from '../../dto/queries/AuditAnalyticsQuery';
import type { MassiveExportDetectionReadModel } from '../../read-models/supervision/MassiveExportDetectionReadModel';

export interface DetectMassiveExportsQuery {
  executer(filtres: AuditAnalyticsQuery): Promise<MassiveExportDetectionReadModel>;
}
