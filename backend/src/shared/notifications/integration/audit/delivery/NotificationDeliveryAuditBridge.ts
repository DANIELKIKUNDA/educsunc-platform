import { obtenirNotificationAuditMemoryStore } from '../store/NotificationAuditMemoryStore';

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export class NotificationDeliveryAuditBridge {
  public obtenirSnapshot() {
    const records = obtenirNotificationAuditMemoryStore().records;
    const delivered = records.filter((record) => record.name === 'NotificationDelivered');
    const latencyValues = delivered
      .map((record) => Date.now() - new Date(record.occurredAt).getTime())
      .filter((value) => Number.isFinite(value) && value >= 0);

    return {
      totalDelivered: delivered.length,
      averageLatencyMs: average(latencyValues),
      byCanal: delivered.reduce<Record<string, number>>((accumulator, record) => {
        accumulator[record.canal] = (accumulator[record.canal] ?? 0) + 1;
        return accumulator;
      }, {}),
    };
  }
}
