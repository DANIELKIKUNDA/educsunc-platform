// Ce contrat de lecture applicative expose une requete optimisee du BC Audit.
import type { AuditExportQuery } from '../../dto/queries/AuditExportQuery';
import type { TimelineExportReadModel } from '../../read-models/exports/TimelineExportReadModel';

export interface PrepareTimelineExportQuery {
  executer(filtres: AuditExportQuery): Promise<TimelineExportReadModel>;
}
