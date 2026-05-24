import { obtenirNotificationAuditMemoryStore } from '../store/NotificationAuditMemoryStore';

export class NotificationReplayAuditBridge {
  public obtenirSnapshot() {
    const records = obtenirNotificationAuditMemoryStore().records;
    const replayed = records.filter(
      (record) => record.name === 'NotificationReplayTriggered' || Boolean(record.replayId),
    );
    return {
      totalReplayed: replayed.length,
      totalWithReplayId: replayed.filter((record) => Boolean(record.replayId)).length,
    };
  }
}
