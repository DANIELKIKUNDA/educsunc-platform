export interface SharedBusEventMetadata {
  readonly eventId: string;
  readonly requestId?: string;
  readonly correlationId?: string;
  readonly parentCorrelationId?: string;
  readonly workflowId?: string;
  readonly causationId?: string;
  readonly traceId?: string;
  readonly spanId?: string;
  readonly parentSpanId?: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly scope?: string;
  readonly sessionId?: string;
  readonly utilisateurId?: string;
  readonly deviceId?: string;
  readonly appVersion?: string;
  readonly plateforme?: string;
  readonly syncId?: string;
  readonly replayId?: string;
  readonly replayReason?: string;
  readonly replaySource?: string;
  readonly replayTimestamp?: string;
  readonly retryCount: number;
  readonly retryReason?: string;
  readonly retryBackoffMs?: number;
  readonly retryHistory: readonly string[];
  readonly occurredAt: string;
  readonly actionTimestamp?: string;
  readonly syncTimestamp?: string;
  readonly retryTimestamp?: string;
}

export interface SharedBusEventEnvelope<TPayload = Record<string, unknown>> {
  readonly name: string;
  readonly payload: TPayload;
  readonly metadata: SharedBusEventMetadata;
}

export interface SharedBusEventHandler {
  readonly eventNames: readonly string[];
  handle(envelope: SharedBusEventEnvelope): Promise<void>;
}

