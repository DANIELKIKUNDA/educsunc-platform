import { obtenirNotificationAuditMemoryStore } from '../store/NotificationAuditMemoryStore';

export class NotificationForensicAuditBridge {
  public listerChronologie(notificationId: string) {
    return obtenirNotificationAuditMemoryStore().records
      .filter((record) => record.notificationId === notificationId)
      .sort((left, right) => left.occurredAt.localeCompare(right.occurredAt));
  }
}
