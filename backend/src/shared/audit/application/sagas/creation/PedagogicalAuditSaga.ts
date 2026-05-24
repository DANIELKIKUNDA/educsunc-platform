import { AuditCreationApplicationService } from '../../services/AuditCreationApplicationService';
import type { CreatePedagogicalAuditInput } from '../../dto/inputs/CreatePedagogicalAuditInput';
import type { AuditEntryOutput } from '../../dto/outputs/AuditEntryOutput';

// Cette saga orchestre un workflow long du BC Audit.
export class PedagogicalAuditSaga {
  constructor(private readonly auditCreationApplicationService: AuditCreationApplicationService) {}

  public async executer(payload: CreatePedagogicalAuditInput): Promise<AuditEntryOutput> {
    return this.auditCreationApplicationService.creerAuditPedagogique(payload);
  }
}
