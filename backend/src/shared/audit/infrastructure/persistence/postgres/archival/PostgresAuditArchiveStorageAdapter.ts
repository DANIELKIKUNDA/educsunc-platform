import { randomUUID } from 'node:crypto';
import type { ArchiveStoragePort } from '../../../../application/ports/outbound/ArchiveStoragePort';

// Cet adaptateur fournit une URL technique temporaire d archive en attendant le vrai cold-storage.
export class PostgresAuditArchiveStorageAdapter implements ArchiveStoragePort {
  public async archiver(payload: Record<string, unknown>): Promise<string> {
    const exportId = typeof payload.exportId === 'string' ? payload.exportId : randomUUID();
    return `audit-archive://${exportId}`;
  }
}

