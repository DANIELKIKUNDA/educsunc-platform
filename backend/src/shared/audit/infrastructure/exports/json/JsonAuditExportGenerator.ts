import { createHash } from 'node:crypto';
import type { AuditExportGenerator } from '../generators/AuditExportGenerator';
import { AuditExportFormatRegistry } from '../formats/AuditExportFormatRegistry';
import type { AuditExportRequest, AuditGeneratedExport } from '../ExportInfrastructureTypes';

// Le JSON reste le format technique de forensic, replay et intégration.
export class JsonAuditExportGenerator implements AuditExportGenerator {
  private readonly formats = new AuditExportFormatRegistry();

  public async generer(request: AuditExportRequest, lignes: Record<string, unknown>[]): Promise<AuditGeneratedExport> {
    const contenu = JSON.stringify(
      {
        exportId: request.exportId,
        organisationId: request.organisationId,
        ecoleId: request.ecoleId,
        scope: request.scope,
        forensic: request.forensic,
        lignes,
      },
      null,
      2,
    );

    return {
      exportId: request.exportId,
      format: 'JSON',
      contenu,
      mimeType: this.formats.mimeType('JSON'),
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
