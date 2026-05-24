// Ce contrat de lecture applicative expose une requete optimisee du BC Audit.
import type { SearchAuditQuery } from '../../dto/queries/SearchAuditQuery';
import type { SensitiveConsultationReadModel } from '../../read-models/consultation/SensitiveConsultationReadModel';

export interface GetSensitiveAuditConsultationQuery {
  executer(filtres: SearchAuditQuery): Promise<SensitiveConsultationReadModel>;
}
