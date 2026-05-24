import { createHash } from 'node:crypto';
import type { AuditGeneratedExport } from '../ExportInfrastructureTypes';

export interface AuditCompressedExport {
  readonly blob: string;
  readonly empreinte: string;
}

// La compression V1 reste simple mais preservée en intégrité et structure.
export class AuditExportCompressionService {
  public compresser(exportGenere: AuditGeneratedExport): AuditCompressedExport {
    const blob = Buffer.from(exportGenere.contenu, 'utf8').toString('base64');
    return {
      blob,
      empreinte: createHash('sha256').update(blob).digest('hex'),
    };
  }
}
