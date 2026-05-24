export type AuditIdempotencyNature =
  | 'ORIGINAL'
  | 'REPLAY'
  | 'RETRY'
  | 'DUPLICATION_IGNOREE';

export type AuditIdempotencyStatutTraitement =
  | 'EN_ATTENTE'
  | 'EN_COURS'
  | 'TRAITE'
  | 'DEAD_LETTER'
  | 'ABANDONNE';

export interface AuditIdempotencyKeyParts {
  readonly eventId?: string;
  readonly replayId?: string;
  readonly syncId?: string;
  readonly exportId?: string;
  readonly requestId?: string;
  readonly operationId?: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly scope?: string;
  readonly sourceTraitement?: string;
}

export interface AuditIdempotencyRegistration {
  readonly cleIdempotence: string;
  readonly idAuditEntry: string;
  readonly dateTraitement: Date;
  readonly nature: AuditIdempotencyNature;
  readonly sourceTraitement: string;
  readonly statutTraitement: AuditIdempotencyStatutTraitement;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly scope?: string;
  readonly replayId?: string;
  readonly syncId?: string;
  readonly requestId?: string;
  readonly operationId?: string;
  readonly exportId?: string;
  readonly fingerprint?: string;
  readonly retryCount: number;
  readonly retryLimit?: number;
  readonly retryBackoffMs?: number;
  readonly historiqueRetry: string[];
}

export interface AuditIdempotencyDecision {
  readonly cleIdempotence: string;
  readonly dejaTraite: boolean;
  readonly doitTraiter: boolean;
  readonly nature: AuditIdempotencyNature;
  readonly raison: string;
  readonly enregistrementExistant?: AuditIdempotencyRegistration;
}

export interface AuditIdempotencyEvaluationRequest {
  readonly parts: AuditIdempotencyKeyParts;
  readonly nature: AuditIdempotencyRegistration['nature'];
}

export interface AuditIdempotencyMonitoringSnapshot {
  readonly totalCles: number;
  readonly totalReplays: number;
  readonly totalRetries: number;
  readonly totalDoublonsIgnores: number;
  readonly totalCollisions: number;
  readonly totalDeadLetters: number;
  readonly totalLocksActifs: number;
}
