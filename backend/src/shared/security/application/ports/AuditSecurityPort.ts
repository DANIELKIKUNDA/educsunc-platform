export interface AuditSecurityPort {
  journaliser(params: {
    action: string;
    idUtilisateur?: string;
    succes: boolean;
    details?: Record<string, unknown>;
  }): Promise<void>;
}
