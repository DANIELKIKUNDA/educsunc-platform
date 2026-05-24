// Ce contrat de lecture applicative expose une requete optimisee du BC Audit.
import type { AuditForensicQuery } from '../../dto/queries/AuditForensicQuery';
import type { SuspiciousActivityReadModel } from '../../read-models/forensic/SuspiciousActivityReadModel';

export interface DetectSuspiciousActivitiesQuery {
  executer(filtres: AuditForensicQuery): Promise<SuspiciousActivityReadModel>;
}
