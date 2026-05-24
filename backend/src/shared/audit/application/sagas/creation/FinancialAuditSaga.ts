import { AuditCreationApplicationService } from '../../services/AuditCreationApplicationService';
import type { CreateFinancialAuditInput } from '../../dto/inputs/CreateFinancialAuditInput';
import type { AuditEntryOutput } from '../../dto/outputs/AuditEntryOutput';

// Cette saga orchestre un workflow long du BC Audit.
export class FinancialAuditSaga {
  constructor(private readonly auditCreationApplicationService: AuditCreationApplicationService) {}

  public async executer(payload: CreateFinancialAuditInput): Promise<AuditEntryOutput> {
    return this.auditCreationApplicationService.creerAuditFinancier(payload);
  }
}
