import { ExporterAuditsUseCase } from '../../use-cases/exports/ExporterAuditsUseCase';
import type { AuditExportQuery } from '../../dto/queries/AuditExportQuery';
import type { AuditExportOutput } from '../../dto/outputs/AuditExportOutput';

// Ce handler applique un flux applicatif Audit sans connaitre HTTP.
export class ExportAuditHandler {
  constructor(private readonly exporterAuditsUseCase: ExporterAuditsUseCase) {}

  public async executer(payload: AuditExportQuery): Promise<AuditExportOutput> {
    return this.exporterAuditsUseCase.executer(payload);
  }
}
