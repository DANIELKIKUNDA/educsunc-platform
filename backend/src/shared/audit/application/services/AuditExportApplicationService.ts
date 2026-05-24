import type { AuditExportQuery } from '../dto/queries/AuditExportQuery';
import type { AuditExportOutput } from '../dto/outputs/AuditExportOutput';
import { AuditExportMapper } from '../mappers/AuditExportMapper';

// Ce service applicatif orchestre une famille de workflows Audit.
export class AuditExportApplicationService {
  public async exporterAudits(payload: AuditExportQuery): Promise<AuditExportOutput> {
    return AuditExportMapper.depuisExportQuery(payload, 0);
  }
  public async exporterAuditForensic(payload: AuditExportQuery): Promise<AuditExportOutput> {
    return AuditExportMapper.depuisExportQuery(payload, 0);
  }
  public async exporterAuditsAnalytics(payload: AuditExportQuery): Promise<AuditExportOutput> {
    return AuditExportMapper.depuisExportQuery(payload, 0);
  }
  public async exporterTimelineAudit(payload: AuditExportQuery): Promise<AuditExportOutput> {
    return AuditExportMapper.depuisExportQuery(payload, 0);
  }
  public async exporterAuditsSecurite(payload: AuditExportQuery): Promise<AuditExportOutput> {
    return AuditExportMapper.depuisExportQuery(payload, 0);
  }
}
