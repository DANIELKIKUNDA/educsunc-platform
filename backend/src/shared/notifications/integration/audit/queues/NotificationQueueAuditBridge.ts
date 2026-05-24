import { obtenirNotificationAuditMemoryStore } from '../store/NotificationAuditMemoryStore';

export class NotificationQueueAuditBridge {
  public obtenirSnapshot() {
    const records = obtenirNotificationAuditMemoryStore().records;
    return {
      totalQueuesObservees: new Set(records.map((record) => record.queueName).filter(Boolean)).size,
      totalQueued: records.filter((record) => record.name === 'NotificationQueued').length,
      totalFailed: records.filter((record) => record.name === 'NotificationFailed').length,
    };
  }
}
