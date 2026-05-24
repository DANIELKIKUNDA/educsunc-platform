import type { AuditExportFormat } from '../ExportInfrastructureTypes';

// Ce registre garde une taxonomie stable des formats supportes par l infrastructure exports.
export class AuditExportFormatRegistry {
  public formatsSupportes(): readonly AuditExportFormat[] {
    return ['PDF', 'CSV', 'JSON'];
  }

  public mimeType(format: AuditExportFormat): string {
    switch (format) {
      case 'PDF':
        return 'application/pdf';
      case 'CSV':
        return 'text/csv';
      case 'JSON':
      default:
        return 'application/json';
    }
  }
}
