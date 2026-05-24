export interface AuditHealthCheckResult {
  readonly statut: 'OK' | 'DEGRADE' | 'KO';
  readonly composant: string;
  readonly message: string;
}

export interface AuditMetricPoint {
  readonly nom: string;
  readonly valeur: number;
  readonly horodatage?: string;
  readonly dimensions?: Record<string, string | undefined>;
}

export interface AuditTraceRecord {
  readonly traceId?: string;
  readonly spanId?: string;
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly sessionId?: string;
  readonly replayId?: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly workerId?: string;
  readonly queueName?: string;
  readonly retryCount?: number;
  readonly eventIds: string[];
  readonly eventNames: string[];
}

export interface AuditAlertRecord {
  readonly code: string;
  readonly severite: 'INFO' | 'AVERTISSEMENT' | 'CRITIQUE';
  readonly message: string;
  readonly contexte?: Record<string, unknown>;
}

export interface AuditDashboardSnapshot {
  readonly health: AuditHealthCheckResult[];
  readonly metrics: AuditMetricPoint[];
  readonly alerts: AuditAlertRecord[];
}

export interface AuditObservabilitySnapshot {
  readonly health: AuditHealthCheckResult[];
  readonly metrics: AuditMetricPoint[];
  readonly traces: AuditTraceRecord[];
  readonly alerts: AuditAlertRecord[];
}
