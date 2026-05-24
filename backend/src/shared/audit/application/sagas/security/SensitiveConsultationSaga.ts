import { AuditCreationApplicationService } from '../../services/AuditCreationApplicationService';
import type { CreateSensitiveConsultationAuditInput } from '../../dto/inputs/CreateSensitiveConsultationAuditInput';
import type { AuditEntryOutput } from '../../dto/outputs/AuditEntryOutput';

// Cette saga orchestre un workflow long du BC Audit.
export class SensitiveConsultationSaga {
  constructor(private readonly auditCreationApplicationService: AuditCreationApplicationService) {}

  public async executer(payload: CreateSensitiveConsultationAuditInput): Promise<AuditEntryOutput> {
    return this.auditCreationApplicationService.creerAuditConsultationSensible(payload);
  }
}
