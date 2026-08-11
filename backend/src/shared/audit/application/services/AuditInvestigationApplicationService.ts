import type { AuditForensicQuery } from '../dto/queries/AuditForensicQuery';
import type { AuditForensicOutput } from '../dto/outputs/AuditForensicOutput';
import type { AuditReadRepositoryPort } from '../ports/outbound/AuditReadRepositoryPort';
import { AuditForensicApplicationService } from './AuditForensicApplicationService';

export class AuditInvestigationApplicationService {
  private readonly forensic: AuditForensicApplicationService;

  public constructor(lectures: AuditReadRepositoryPort) {
    this.forensic = new AuditForensicApplicationService(lectures);
  }

  public async investiguerExportMassif(payload: AuditForensicQuery): Promise<AuditForensicOutput> {
    return this.forensic.lancerInvestigation(payload);
  }

  public async investiguerWorkflow(payload: AuditForensicQuery): Promise<AuditForensicOutput> {
    return this.forensic.reconstruireWorkflow(payload);
  }

  public async investiguerIncident(payload: AuditForensicQuery): Promise<AuditForensicOutput> {
    return this.forensic.lancerInvestigation(payload);
  }
}
