import { AuditCreationApplicationService } from '../../services/AuditCreationApplicationService';
import type { CreateSecurityAuditInput } from '../../dto/inputs/CreateSecurityAuditInput';
import type { AuditEntryOutput } from '../../dto/outputs/AuditEntryOutput';

// Cette saga orchestre un workflow long du BC Audit.
export class CriticalSecurityEventSaga {
  constructor(private readonly auditCreationApplicationService: AuditCreationApplicationService) {}

  public async executer(payload: CreateSecurityAuditInput): Promise<AuditEntryOutput> {
    return this.auditCreationApplicationService.creerAuditSecurite(payload);
  }
}
