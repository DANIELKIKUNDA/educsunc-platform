import { createHash } from 'node:crypto';
import type { AuditColdStoragePackage } from '../AuditColdStorageTypes';

// Cette compression reste sobre mais preserve une empreinte stable et un blob compactable.
export class PostgresAuditCompressionService {
  public compresser(payload: Omit<AuditColdStoragePackage, 'blob' | 'empreinteCompression'>): Pick<AuditColdStoragePackage, 'blob' | 'empreinteCompression'> {
    const json = JSON.stringify(payload);
    const blob = Buffer.from(json, 'utf8').toString('base64');
    const empreinteCompression = createHash('sha256').update(blob).digest('hex');
    return { blob, empreinteCompression };
  }
}

