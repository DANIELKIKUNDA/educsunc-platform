import { createHash } from 'node:crypto';
import type { AuditExportGenerator } from '../generators/AuditExportGenerator';
import { AuditExportFormatRegistry } from '../formats/AuditExportFormatRegistry';
import type { AuditExportRequest, AuditGeneratedExport } from '../ExportInfrastructureTypes';

// La version V1 genere un PDF logique sérialisé, traçable et stable pour conformité.
export class PdfAuditExportGenerator implements AuditExportGenerator {
  private readonly formats = new AuditExportFormatRegistry();

  public async generer(request: AuditExportRequest, lignes: Record<string, unknown>[]): Promise<AuditGeneratedExport> {
    const contenu = [
      'AUDIT EXPORT PDF',
      `exportId=${request.exportId}`,
      `tenant=${request.organisationId ?? 'NA'}:${request.ecoleId ?? 'NA'}:${request.scope ?? 'NA'}`,
      JSON.stringify(lignes, null, 2),
    ].join('\n');
    return {
      exportId: request.exportId,
      format: 'PDF',
      contenu,
      mimeType: this.formats.mimeType('PDF'),
      nombreElements: lignes.length,
      organisationId: request.organisationId,
      ecoleId: request.ecoleId,
      scope: request.scope,
      acteurId: request.acteurId,
      forensic: request.forensic,
      expireLe: request.expirationLe,
      creeLe: new Date().toISOString(),
      empreinte: createHash('sha256').update(contenu).digest('hex'),
    };
  }
}
