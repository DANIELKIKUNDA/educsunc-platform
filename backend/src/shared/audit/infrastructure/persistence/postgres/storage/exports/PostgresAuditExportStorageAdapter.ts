import { randomUUID } from 'node:crypto';
import type { ExportStoragePort } from '../../../../../application/ports/outbound/ExportStoragePort';

// Cet adaptateur fournit une URL technique d export stocke sans lier encore un fournisseur externe.
export class PostgresAuditExportStorageAdapter implements ExportStoragePort {
  public async sauvegarderExport(payload: Record<string, unknown>): Promise<string> {
    const exportId = typeof payload.exportId === 'string' ? payload.exportId : randomUUID();
    return `audit-export://${exportId}`;
  }
}

