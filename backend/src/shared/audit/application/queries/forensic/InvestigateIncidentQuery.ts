// Ce contrat de lecture applicative expose une requete optimisee du BC Audit.
import type { AuditForensicQuery } from '../../dto/queries/AuditForensicQuery';
import type { AuditForensicReadModel } from '../../read-models/forensic/AuditForensicReadModel';

export interface InvestigateIncidentQuery {
  executer(filtres: AuditForensicQuery): Promise<AuditForensicReadModel>;
}
