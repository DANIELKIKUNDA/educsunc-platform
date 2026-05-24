import { UseCase } from '../../../../application/UseCase';
import { AuditExportApplicationService } from '../../services/AuditExportApplicationService';
import type { AuditExportQuery } from '../../dto/queries/AuditExportQuery';
import type { AuditExportOutput } from '../../dto/outputs/AuditExportOutput';

// Ce cas d'usage orchestre une operation applicative du BC Audit.
export class ExporterAuditsSecuriteUseCase implements UseCase<AuditExportQuery, AuditExportOutput> {
  constructor(private readonly service: AuditExportApplicationService) {}

  public async executer(entree: AuditExportQuery): Promise<AuditExportOutput> {
    return this.service.exporterAuditsSecurite(entree);
  }
}
