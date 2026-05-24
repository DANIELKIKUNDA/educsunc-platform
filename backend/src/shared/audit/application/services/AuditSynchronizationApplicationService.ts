import type { OfflineAuditSyncStatusInput } from '../dto/offline/OfflineAuditSyncStatusInput';
import type { OfflineAuditConflictInput } from '../dto/offline/OfflineAuditConflictInput';
import type { OfflineAuditRetryInput } from '../dto/offline/OfflineAuditRetryInput';
import type { AuditOfflineStatusOutput } from '../dto/outputs/AuditOfflineStatusOutput';

// Ce service applicatif orchestre une famille de workflows Audit.
export class AuditSynchronizationApplicationService {
  public async marquerSynchronise(payload: OfflineAuditSyncStatusInput): Promise<AuditOfflineStatusOutput> {
    return { total: 1, synchronises: payload.statutSynchronisation === 'SYNCED' ? 1 : 0, enConflit: 0, enAttente: payload.statutSynchronisation === 'SYNCED' ? 0 : 1, auditId: payload.auditId, statutSynchronisation: payload.statutSynchronisation, horodatage: new Date().toISOString() };
  }
  public async enregistrerConflit(payload: OfflineAuditConflictInput): Promise<AuditOfflineStatusOutput> {
    return { total: 1, synchronises: 0, enConflit: 1, enAttente: 0, auditId: payload.auditId, conflit: true, statutSynchronisation: payload.resolution, horodatage: new Date().toISOString() };
  }
  public async enregistrerRetry(payload: OfflineAuditRetryInput): Promise<AuditOfflineStatusOutput> {
    return { total: 1, synchronises: 0, enConflit: 0, enAttente: 1, auditId: payload.auditId, retry: true, horodatage: new Date().toISOString() };
  }
}
