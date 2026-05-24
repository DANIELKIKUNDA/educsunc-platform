import type { AuditExportRequest, AuditGeneratedExport } from '../ExportInfrastructureTypes';

export interface AuditExportGenerator {
  generer(request: AuditExportRequest, lignes: Record<string, unknown>[]): Promise<AuditGeneratedExport>;
}
