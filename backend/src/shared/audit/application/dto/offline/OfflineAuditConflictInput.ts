// Ce DTO specialise un sous-flux applicatif Audit.
export interface OfflineAuditConflictInput { readonly auditId: string; readonly resolution: string; readonly justification?: string; }
