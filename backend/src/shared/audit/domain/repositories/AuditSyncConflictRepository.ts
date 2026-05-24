import type { AuditSyncConflictRecord } from './AuditRepositoryTypes';

// Ce repository historise les conflits de synchronisation offline-first.
export interface AuditSyncConflictRepository {
  enregistrerConflit(conflit: AuditSyncConflictRecord): Promise<void>;
  retrouverConflit(idAuditConflict: string): Promise<AuditSyncConflictRecord | null>;
  listerConflits(filtres?: { statutResolution?: string; organisationId?: string; ecoleId?: string }): Promise<AuditSyncConflictRecord[]>;
  suivreResolution(idAuditConflict: string, statutResolution: string, dateResolution?: Date): Promise<void>;
}
