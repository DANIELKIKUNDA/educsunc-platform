import { ExporterTimelineAuditUseCase } from '../../use-cases/exports/ExporterTimelineAuditUseCase';
import type { AuditExportQuery } from '../../dto/queries/AuditExportQuery';
import type { AuditExportOutput } from '../../dto/outputs/AuditExportOutput';

// Ce handler applique un flux applicatif Audit sans connaitre HTTP.
export class ExportTimelineAuditHandler {
  constructor(private readonly exporterTimelineAuditUseCase: ExporterTimelineAuditUseCase) {}

  public async executer(payload: AuditExportQuery): Promise<AuditExportOutput> {
    return this.exporterTimelineAuditUseCase.executer(payload);
  }
}
