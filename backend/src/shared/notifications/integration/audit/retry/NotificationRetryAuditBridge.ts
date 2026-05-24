import { obtenirNotificationAuditMemoryStore } from '../store/NotificationAuditMemoryStore';

export class NotificationRetryAuditBridge {
  public obtenirSnapshot() {
    const records = obtenirNotificationAuditMemoryStore().records;
    const retried = records.filter((record) => record.name === 'NotificationRetried');
    return {
      totalRetried: retried.length,
      totalRetryCount: retried.reduce((sum, record) => sum + record.retryCount, 0),
    };
  }
}
