// Ce contrat de lecture applicative expose une requete optimisee du BC Audit.
import type { AuditExportQuery } from '../../dto/queries/AuditExportQuery';
import type { AuditExportReadModel } from '../../read-models/exports/AuditExportReadModel';

export interface PrepareAuditExportQuery {
  executer(filtres: AuditExportQuery): Promise<AuditExportReadModel>;
}
