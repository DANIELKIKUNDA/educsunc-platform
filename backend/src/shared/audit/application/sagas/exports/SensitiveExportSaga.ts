import { AuditExportApplicationService } from '../../services/AuditExportApplicationService';
import type { AuditExportQuery } from '../../dto/queries/AuditExportQuery';
import type { AuditExportOutput } from '../../dto/outputs/AuditExportOutput';

// Cette saga orchestre un workflow long du BC Audit.
export class SensitiveExportSaga {
  constructor(private readonly auditExportApplicationService: AuditExportApplicationService) {}

  public async executer(payload: AuditExportQuery): Promise<AuditExportOutput> {
    return this.auditExportApplicationService.exporterAuditsSecurite(payload);
  }
}
