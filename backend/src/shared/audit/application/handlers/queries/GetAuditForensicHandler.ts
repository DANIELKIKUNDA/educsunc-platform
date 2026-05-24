import { LancerInvestigationForensicUseCase } from '../../use-cases/forensic/LancerInvestigationForensicUseCase';
import type { AuditForensicQuery } from '../../dto/queries/AuditForensicQuery';
import type { AuditForensicOutput } from '../../dto/outputs/AuditForensicOutput';

// Ce handler applique un flux applicatif Audit sans connaitre HTTP.
export class GetAuditForensicHandler {
  constructor(private readonly lancerInvestigationForensicUseCase: LancerInvestigationForensicUseCase) {}

  public async executer(payload: AuditForensicQuery): Promise<AuditForensicOutput> {
    return this.lancerInvestigationForensicUseCase.executer(payload);
  }
}
