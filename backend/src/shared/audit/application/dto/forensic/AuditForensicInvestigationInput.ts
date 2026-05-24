// Ce DTO specialise un sous-flux applicatif Audit.
export interface AuditForensicInvestigationInput { readonly incidentId?: string; readonly correlationId?: string; readonly contexte?: Record<string, unknown>; }
