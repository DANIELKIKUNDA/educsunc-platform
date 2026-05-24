import { obtenirNotificationAuditMemoryStore } from '../store/NotificationAuditMemoryStore';

export class NotificationWorkerAuditBridge {
  public obtenirSnapshot() {
    const records = obtenirNotificationAuditMemoryStore().records;
    return {
      totalWorkersObserves: new Set(records.map((record) => record.workerId).filter(Boolean)).size,
      totalSent: records.filter((record) => record.name === 'NotificationSent').length,
      totalDelivered: records.filter((record) => record.name === 'NotificationDelivered').length,
    };
  }
}
