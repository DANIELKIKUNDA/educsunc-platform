// Ce port applicatif formalise une frontiere du BC Audit.
import type { OfflineAuditConflictInput, OfflineAuditReplayInput, OfflineAuditRetryInput, OfflineAuditSyncStatusInput } from '../../dto/offline';
import type { AuditOfflineStatusOutput } from '../../dto/outputs';

// Ce port expose les operations offline-first du BC Audit.
export interface AuditOfflinePort {
  creerAuditOffline(input: Record<string, unknown>): Promise<Record<string, unknown>>;
  rejouerAuditOffline(input: OfflineAuditReplayInput): Promise<AuditOfflineStatusOutput>;
  resoudreConflitAudit(input: OfflineAuditConflictInput): Promise<AuditOfflineStatusOutput>;
  obtenirAuditsNonSynchronises(): Promise<AuditOfflineStatusOutput>;
  marquerAuditSynchronise(input: OfflineAuditSyncStatusInput): Promise<AuditOfflineStatusOutput>;
  enregistrerRetry(input: OfflineAuditRetryInput): Promise<AuditOfflineStatusOutput>;
}
