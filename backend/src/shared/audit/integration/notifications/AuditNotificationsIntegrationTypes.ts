import type { NotificationAuditSnapshot } from 'shared/notifications';

export interface AuditNotificationsIntegrationSnapshot {
  readonly monitoring: NotificationAuditSnapshot;
  readonly queues: Record<string, unknown>;
  readonly workers: Record<string, unknown>;
  readonly retry: Record<string, unknown>;
  readonly replay: Record<string, unknown>;
  readonly delivery: Record<string, unknown>;
  readonly preferences: Record<string, unknown>;
  readonly observability: Record<string, unknown>;
}
