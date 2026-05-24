export interface SecurityAuditEvent {
  readonly action: string;
  readonly idUtilisateur?: string;
  readonly succes: boolean;
  readonly details?: Record<string, unknown>;
}
