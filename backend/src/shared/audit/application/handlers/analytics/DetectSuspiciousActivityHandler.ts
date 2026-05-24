import { DetecterActionsSuspectesUseCase } from '../../use-cases/forensic/DetecterActionsSuspectesUseCase';
import type { AuditForensicQuery } from '../../dto/queries/AuditForensicQuery';
import type { AuditForensicOutput } from '../../dto/outputs/AuditForensicOutput';

// Ce handler applique un flux applicatif Audit sans connaitre HTTP.
export class DetectSuspiciousActivityHandler {
  constructor(private readonly detecterActionsSuspectesUseCase: DetecterActionsSuspectesUseCase) {}

  public async executer(payload: AuditForensicQuery): Promise<AuditForensicOutput> {
    return this.detecterActionsSuspectesUseCase.executer(payload);
  }
}
