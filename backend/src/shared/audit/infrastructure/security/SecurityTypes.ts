export interface AuditIntegritySnapshot {
  readonly totalEntries: number;
  readonly totalEmpreintes: number;
  readonly anomalies: string[];
}

export interface AuditAccessDecision {
  readonly autorise: boolean;
  readonly raison: string;
}

export interface AuditSecurityIncident {
  readonly code: string;
  readonly message: string;
  readonly severite: 'INFO' | 'AVERTISSEMENT' | 'CRITIQUE';
  readonly contexte?: Record<string, unknown>;
}
