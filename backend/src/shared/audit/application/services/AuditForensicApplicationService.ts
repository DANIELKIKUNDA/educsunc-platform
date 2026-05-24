import type { AuditForensicQuery } from '../dto/queries/AuditForensicQuery';
import type { AuditForensicOutput } from '../dto/outputs/AuditForensicOutput';
import { AuditForensicMapper } from '../mappers/AuditForensicMapper';

// Ce service applicatif orchestre une famille de workflows Audit.
export class AuditForensicApplicationService {
  public async lancerInvestigation(payload: AuditForensicQuery): Promise<AuditForensicOutput> {
    return AuditForensicMapper.depuisForensicQuery(payload);
  }
  public async reconstruireWorkflow(payload: AuditForensicQuery): Promise<AuditForensicOutput> {
    return { ...AuditForensicMapper.depuisForensicQuery(payload), resume: 'Workflow reconstruit' };
  }
  public async detecterActionsSuspectes(payload: AuditForensicQuery): Promise<AuditForensicOutput> {
    return { ...AuditForensicMapper.depuisForensicQuery(payload), resume: 'Actions suspectes analysees' };
  }
}
