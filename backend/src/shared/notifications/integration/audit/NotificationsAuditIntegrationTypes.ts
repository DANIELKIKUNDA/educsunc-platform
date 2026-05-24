import type { NotificationContext } from '../../context';

export interface NotificationAuditPublishRequest {
  readonly name:
    | 'NotificationQueued'
    | 'NotificationSent'
    | 'NotificationFailed'
    | 'NotificationRetried'
    | 'NotificationDelivered'
    | 'NotificationRead'
    | 'NotificationReplayTriggered'
    | 'NotificationPreferenceChanged';
  readonly payload: Record<string, unknown>;
  readonly notificationContext: NotificationContext;
}

export interface NotificationAuditRecord {
  readonly name: NotificationAuditPublishRequest['name'];
  readonly notificationId: string;
  readonly canal: NotificationContext['canal'];
  readonly provider?: string;
  readonly queueName?: string;
  readonly workerId?: string;
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly replayId?: string;
  readonly retryCount: number;
  readonly occurredAt: string;
}

export interface NotificationAuditSnapshot {
  readonly totalEvents: number;
  readonly queued: number;
  readonly sent: number;
  readonly failed: number;
  readonly retried: number;
  readonly delivered: number;
  readonly replayed: number;
  readonly preferenceChanges: number;
  readonly providerFailures: number;
  readonly deliveryLatencyMsAverage: number;
}
