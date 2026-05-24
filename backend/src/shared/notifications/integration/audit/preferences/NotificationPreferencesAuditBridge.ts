import { obtenirNotificationAuditMemoryStore } from '../store/NotificationAuditMemoryStore';

export class NotificationPreferencesAuditBridge {
  public obtenirSnapshot() {
    const changes = obtenirNotificationAuditMemoryStore().records.filter(
      (record) => record.name === 'NotificationPreferenceChanged',
    );

    return {
      totalPreferenceChanges: changes.length,
      totalCanauxTouches: new Set(changes.map((record) => record.canal)).size,
    };
  }
}
