export interface AuditEventMetadata {
  readonly eventId: string;
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly sessionId?: string;
  readonly replayId?: string;
  readonly syncId?: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly scope?: string;
  readonly replay: boolean;
  readonly retryCount: number;
  readonly occurredAt: string;
}

export interface AuditEventEnvelope {
  readonly name: string;
  readonly payload: Record<string, unknown>;
  readonly metadata: AuditEventMetadata;
}

export interface AuditDeadLetterEvent {
  readonly envelope: AuditEventEnvelope;
  readonly reason: string;
  readonly failedAt: string;
}

