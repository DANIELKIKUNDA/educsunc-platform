export interface NotificationContext {
  readonly notificationId: string;
  readonly canal: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP' | 'WHATSAPP';
  readonly requestId?: string;
  readonly correlationId?: string;
  readonly traceId?: string;
  readonly spanId?: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly utilisateurId?: string;
  readonly acteurId?: string;
  readonly sessionId?: string;
  readonly deviceId?: string;
  readonly provider?: string;
  readonly queueName?: string;
  readonly workerId?: string;
  readonly syncId?: string;
  readonly replayId?: string;
  readonly replayReason?: string;
  readonly replaySource?: string;
  readonly retryCount?: number;
  readonly retryReason?: string;
  readonly retryBackoffMs?: number;
  readonly retryHistory?: readonly string[];
  readonly requestedAt: string;
  readonly deliveredAt?: string;
  readonly targetDeviceId?: string;
}
