import { UseCase } from '../../../../application/UseCase';
import { AuditExportApplicationService } from '../../services/AuditExportApplicationService';
import type { AuditExportQuery } from '../../dto/queries/AuditExportQuery';
import type { AuditExportOutput } from '../../dto/outputs/AuditExportOutput';

// Ce cas d usage orchestre un export analytique du module Audit.
export class ExporterAuditsAnalyticsUseCase implements UseCase<AuditExportQuery, AuditExportOutput> {
  constructor(private readonly service: AuditExportApplicationService) {}

  public async executer(entree: AuditExportQuery): Promise<AuditExportOutput> {
    return this.service.exporterAuditsAnalytics(entree);
  }
}
