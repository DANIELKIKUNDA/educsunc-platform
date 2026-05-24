import type { NotificationAuditSnapshot } from '../NotificationsAuditIntegrationTypes';
import { obtenirNotificationAuditMemoryStore } from '../store/NotificationAuditMemoryStore';

export class NotificationMonitoringAuditBridge {
  public obtenirSnapshot(): NotificationAuditSnapshot {
    const records = obtenirNotificationAuditMemoryStore().records;
    const delivered = records.filter((record) => record.name === 'NotificationDelivered');
    const latencyValues = delivered
      .map((record) => Date.now() - new Date(record.occurredAt).getTime())
      .filter((value) => Number.isFinite(value) && value >= 0);
    const averageLatency =
      latencyValues.length === 0
        ? 0
        : latencyValues.reduce((sum, value) => sum + value, 0) / latencyValues.length;

    return {
      totalEvents: records.length,
      queued: records.filter((record) => record.name === 'NotificationQueued').length,
      sent: records.filter((record) => record.name === 'NotificationSent').length,
      failed: records.filter((record) => record.name === 'NotificationFailed').length,
      retried: records.filter((record) => record.name === 'NotificationRetried').length,
      delivered: delivered.length,
      replayed: records.filter((record) => record.name === 'NotificationReplayTriggered').length,
      preferenceChanges: records.filter((record) => record.name === 'NotificationPreferenceChanged').length,
      providerFailures: records.filter(
        (record) => record.name === 'NotificationFailed' && Boolean(record.provider),
      ).length,
      deliveryLatencyMsAverage: averageLatency,
    };
  }
}
