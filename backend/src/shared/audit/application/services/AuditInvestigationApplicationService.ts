import type { AuditForensicQuery } from '../dto/queries/AuditForensicQuery';
import type { AuditForensicOutput } from '../dto/outputs/AuditForensicOutput';
import { AuditForensicMapper } from '../mappers/AuditForensicMapper';

// Ce service applicatif orchestre une famille de workflows Audit.
export class AuditInvestigationApplicationService {
  public async investiguerExportMassif(payload: AuditForensicQuery): Promise<AuditForensicOutput> {
    return { ...AuditForensicMapper.depuisForensicQuery(payload), resume: 'Investigation export massif terminee' };
  }
  public async investiguerWorkflow(payload: AuditForensicQuery): Promise<AuditForensicOutput> {
    return { ...AuditForensicMapper.depuisForensicQuery(payload), resume: 'Investigation workflow terminee' };
  }
  public async investiguerIncident(payload: AuditForensicQuery): Promise<AuditForensicOutput> {
    return { ...AuditForensicMapper.depuisForensicQuery(payload), resume: 'Investigation incident terminee' };
  }
}
