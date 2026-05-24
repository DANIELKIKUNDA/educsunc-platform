// Ce contrat de lecture applicative expose une requete optimisee du BC Audit.
import type { AuditExportQuery } from '../../dto/queries/AuditExportQuery';
import type { ForensicExportReadModel } from '../../read-models/exports/ForensicExportReadModel';

export interface PrepareForensicExportQuery {
  executer(filtres: AuditExportQuery): Promise<ForensicExportReadModel>;
}
