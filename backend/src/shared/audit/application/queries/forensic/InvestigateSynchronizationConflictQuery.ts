// Ce contrat de lecture applicative expose une requete optimisee du BC Audit.
import type { AuditForensicQuery } from '../../dto/queries/AuditForensicQuery';
import type { ForensicSynchronizationReadModel } from '../../read-models/forensic/ForensicSynchronizationReadModel';

export interface InvestigateSynchronizationConflictQuery {
  executer(filtres: AuditForensicQuery): Promise<ForensicSynchronizationReadModel>;
}
