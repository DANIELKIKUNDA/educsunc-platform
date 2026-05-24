import { AuditCreationApplicationService } from '../../services/AuditCreationApplicationService';
import type { CreateSystemAuditInput } from '../../dto/inputs/CreateSystemAuditInput';
import type { AuditEntryOutput } from '../../dto/outputs/AuditEntryOutput';

// Cette saga orchestre un workflow long du BC Audit.
export class SystemAuditSaga {
  constructor(private readonly auditCreationApplicationService: AuditCreationApplicationService) {}

  public async executer(payload: CreateSystemAuditInput): Promise<AuditEntryOutput> {
    return this.auditCreationApplicationService.creerAuditSysteme(payload);
  }
}
