import { createHash } from 'node:crypto';
import type { AuditExportGenerator } from '../generators/AuditExportGenerator';
import { AuditExportFormatRegistry } from '../formats/AuditExportFormatRegistry';
import type { AuditExportRequest, AuditGeneratedExport } from '../ExportInfrastructureTypes';

function flatten(record: Record<string, unknown>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [key, typeof value === 'string' ? value : JSON.stringify(value)]),
  );
}

// Le CSV sert la volumetrie, Excel et le reporting sans charger tout en RAM applicative.
export class CsvAuditExportGenerator implements AuditExportGenerator {
  private readonly formats = new AuditExportFormatRegistry();

  public async generer(request: AuditExportRequest, lignes: Record<string, unknown>[]): Promise<AuditGeneratedExport> {
    const rows = lignes.map(flatten);
    const headers = [...new Set(rows.flatMap((row) => Object.keys(row)))];
    const content = [
      headers.join(','),
      ...rows.map((row) => headers.map((header) => JSON.stringify(row[header] ?? '')).join(',')),
    ].join('\n');

    return {
      exportId: request.exportId,
      format: 'CSV',
      contenu: content,
      mimeType: this.formats.mimeType('CSV'),
      nombreElements: lignes.length,
      organisationId: request.organisationId,
      ecoleId: request.ecoleId,
      scope: request.scope,
      acteurId: request.acteurId,
      forensic: request.forensic,
      expireLe: request.expirationLe,
      creeLe: new Date().toISOString(),
      empreinte: createHash('sha256').update(content).digest('hex'),
    };
  }
}
