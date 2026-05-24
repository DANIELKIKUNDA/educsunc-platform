import { ExporterAuditForensicUseCase } from '../../use-cases/exports/ExporterAuditForensicUseCase';
import type { AuditExportQuery } from '../../dto/queries/AuditExportQuery';
import type { AuditExportOutput } from '../../dto/outputs/AuditExportOutput';

// Ce handler applique un flux applicatif Audit sans connaitre HTTP.
export class ExportForensicAuditHandler {
  constructor(private readonly exporterAuditForensicUseCase: ExporterAuditForensicUseCase) {}

  public async executer(payload: AuditExportQuery): Promise<AuditExportOutput> {
    return this.exporterAuditForensicUseCase.executer(payload);
  }
}
