import type { OfflineAuditReplayInput } from '../dto/offline/OfflineAuditReplayInput';
import type { OfflineAuditRetryInput } from '../dto/offline/OfflineAuditRetryInput';
import type { AuditOfflineStatusOutput } from '../dto/outputs/AuditOfflineStatusOutput';

// Ce service applicatif orchestre une famille de workflows Audit.
export class AuditReplayApplicationService {
  public async rejouer(payload: OfflineAuditReplayInput): Promise<AuditOfflineStatusOutput> {
    return { total: 1, synchronises: 0, enConflit: 0, enAttente: 1, auditId: payload.auditId, replay: true, horodatage: new Date().toISOString() };
  }
  public async retry(payload: OfflineAuditRetryInput): Promise<AuditOfflineStatusOutput> {
    return { total: 1, synchronises: 0, enConflit: 0, enAttente: 1, auditId: payload.auditId, retry: true, horodatage: new Date().toISOString() };
  }
}
