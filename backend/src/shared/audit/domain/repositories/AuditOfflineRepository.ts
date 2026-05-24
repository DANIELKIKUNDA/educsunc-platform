import type { AuditSyncConflictRecord } from './AuditRepositoryTypes';

// Ce repository suit les entrees d'audit produites offline puis synchronisees.
export interface AuditOfflineRepository {
  listerEnAttenteSynchronisation(): Promise<string[]>;
  listerConflits(): Promise<AuditSyncConflictRecord[]>;
  listerReplays(): Promise<string[]>;
  listerRetries(): Promise<string[]>;
  listerSynchronisations(): Promise<string[]>;
  marquerSynchronise?(idAudit: string, dateSynchronisation: Date): Promise<void>;
}
