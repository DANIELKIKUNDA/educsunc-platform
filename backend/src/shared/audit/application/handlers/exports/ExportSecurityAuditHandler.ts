import { ExporterAuditsSecuriteUseCase } from '../../use-cases/exports/ExporterAuditsSecuriteUseCase';
import type { AuditExportQuery } from '../../dto/queries/AuditExportQuery';
import type { AuditExportOutput } from '../../dto/outputs/AuditExportOutput';

// Ce handler applique un flux applicatif Audit sans connaitre HTTP.
export class ExportSecurityAuditHandler {
  constructor(private readonly exporterAuditsSecuriteUseCase: ExporterAuditsSecuriteUseCase) {}

  public async executer(payload: AuditExportQuery): Promise<AuditExportOutput> {
    return this.exporterAuditsSecuriteUseCase.executer(payload);
  }
}
