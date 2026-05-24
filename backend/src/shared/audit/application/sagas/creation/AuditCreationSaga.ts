import { AuditCreationApplicationService } from '../../services/AuditCreationApplicationService';
import type { CreateAuditEntryInput } from '../../dto/inputs/CreateAuditEntryInput';
import type { AuditEntryOutput } from '../../dto/outputs/AuditEntryOutput';

// Cette saga orchestre un workflow long du BC Audit.
export class AuditCreationSaga {
  constructor(private readonly auditCreationApplicationService: AuditCreationApplicationService) {}

  public async executer(payload: CreateAuditEntryInput): Promise<AuditEntryOutput> {
    return this.auditCreationApplicationService.creerAudit(payload);
  }
}
