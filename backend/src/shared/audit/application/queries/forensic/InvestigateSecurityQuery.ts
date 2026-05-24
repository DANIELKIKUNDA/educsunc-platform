// Ce contrat de lecture applicative expose une requete optimisee du BC Audit.
import type { AuditForensicQuery } from '../../dto/queries/AuditForensicQuery';
import type { ForensicSecurityReadModel } from '../../read-models/forensic/ForensicSecurityReadModel';

export interface InvestigateSecurityQuery {
  executer(filtres: AuditForensicQuery): Promise<ForensicSecurityReadModel>;
}
