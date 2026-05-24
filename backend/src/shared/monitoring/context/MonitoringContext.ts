export interface MonitoringContext {
  readonly requestId?: string;
  readonly correlationId?: string;
  readonly traceId?: string;
  readonly spanId?: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly utilisateurId?: string;
  readonly sessionId?: string;
  readonly deviceId?: string;
  readonly workerId?: string;
  readonly queueName?: string;
  readonly replayId?: string;
  readonly retryCount?: number;
  readonly syncId?: string;
  readonly startedAt: string;
  readonly durationMs?: number;
  readonly route?: string;
  readonly method?: string;
  readonly statusCode?: number;
}
