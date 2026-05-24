import { obtenirNotificationAuditMemoryStore } from '../store/NotificationAuditMemoryStore';

export class NotificationObservabilityAuditBridge {
  public obtenirSnapshot() {
    const records = obtenirNotificationAuditMemoryStore().records;
    return {
      totalWithCorrelation: records.filter((record) => Boolean(record.correlationId)).length,
      totalWithTenant: records.filter((record) => Boolean(record.organisationId || record.ecoleId)).length,
      totalWithWorker: records.filter((record) => Boolean(record.workerId)).length,
      totalWithQueue: records.filter((record) => Boolean(record.queueName)).length,
    };
  }
}
