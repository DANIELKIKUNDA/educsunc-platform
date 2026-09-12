import type { SnapshotQueueBullMqShared } from 'shared/infrastructure/queues/bullmq';
import type { VueSurveillanceFilesNotifications } from './TypesMonitoringNotification';
interface QueueObservable { observerQueue(): SnapshotQueueBullMqShared; }
export class SurveillanceQueuesNotificationBullMq {
  constructor(private readonly queues: { dispatch: QueueObservable; retry: QueueObservable; replay: QueueObservable; escalade: QueueObservable }, private readonly seuilSaturation = 100) {}
  public observer(): VueSurveillanceFilesNotifications {
    const total = (q: QueueObservable) => { const s=q.observerQueue() as unknown as Record<string, number>; return Number(s.waiting ?? s.enAttente ?? s.total ?? 0); };
    const totalDispatch=total(this.queues.dispatch), totalRetry=total(this.queues.retry), totalReplay=total(this.queues.replay), totalEscalade=total(this.queues.escalade);
    return { totalDispatch, totalRetry, totalReplay, totalEscalade, totalDeadLetter: 0, saturationDetectee: [totalDispatch,totalRetry,totalReplay,totalEscalade].some(v=>v>=this.seuilSaturation) };
  }
}
