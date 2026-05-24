import type {
  NotificationAuditPublishRequest,
  NotificationAuditSnapshot,
} from '../NotificationsAuditIntegrationTypes';
import { NotificationDeliveryAuditBridge } from '../delivery/NotificationDeliveryAuditBridge';
import { NotificationForensicAuditBridge } from '../forensic/NotificationForensicAuditBridge';
import { NotificationAuditPreparationHandler } from '../handlers/NotificationAuditPreparationHandler';
import { NotificationAuditContextMapper } from '../mappers/NotificationAuditContextMapper';
import { NotificationMonitoringAuditBridge } from '../monitoring/NotificationMonitoringAuditBridge';
import { NotificationObservabilityAuditBridge } from '../observability/NotificationObservabilityAuditBridge';
import { NotificationPreferencesAuditBridge } from '../preferences/NotificationPreferencesAuditBridge';
import { NotificationAuditEventPublisher } from '../publishers/NotificationAuditEventPublisher';
import { NotificationQueueAuditBridge } from '../queues/NotificationQueueAuditBridge';
import { NotificationReplayAuditBridge } from '../replay/NotificationReplayAuditBridge';
import { NotificationRetryAuditBridge } from '../retry/NotificationRetryAuditBridge';
import { NotificationWorkerAuditBridge } from '../workers/NotificationWorkerAuditBridge';

export class NotificationsAuditIntegrationOrchestrator {
  public readonly publisher = new NotificationAuditEventPublisher();
  public readonly queues = new NotificationQueueAuditBridge();
  public readonly workers = new NotificationWorkerAuditBridge();
  public readonly retry = new NotificationRetryAuditBridge();
  public readonly replay = new NotificationReplayAuditBridge();
  public readonly delivery = new NotificationDeliveryAuditBridge();
  public readonly preferences = new NotificationPreferencesAuditBridge();
  public readonly monitoring = new NotificationMonitoringAuditBridge();
  public readonly forensic = new NotificationForensicAuditBridge();
  public readonly observability = new NotificationObservabilityAuditBridge();

  private readonly preparation = new NotificationAuditPreparationHandler();

  public async publier(request: NotificationAuditPublishRequest) {
    const prepared = this.preparation.preparer(request);
    void NotificationAuditContextMapper.versMetadata(prepared.notificationContext);
    return this.publisher.publier(prepared);
  }

  public obtenirSnapshot(): {
    monitoring: NotificationAuditSnapshot;
    queues: ReturnType<NotificationQueueAuditBridge['obtenirSnapshot']>;
    workers: ReturnType<NotificationWorkerAuditBridge['obtenirSnapshot']>;
    retry: ReturnType<NotificationRetryAuditBridge['obtenirSnapshot']>;
    replay: ReturnType<NotificationReplayAuditBridge['obtenirSnapshot']>;
    delivery: ReturnType<NotificationDeliveryAuditBridge['obtenirSnapshot']>;
    preferences: ReturnType<NotificationPreferencesAuditBridge['obtenirSnapshot']>;
    observability: ReturnType<NotificationObservabilityAuditBridge['obtenirSnapshot']>;
  } {
    return {
      monitoring: this.monitoring.obtenirSnapshot(),
      queues: this.queues.obtenirSnapshot(),
      workers: this.workers.obtenirSnapshot(),
      retry: this.retry.obtenirSnapshot(),
      replay: this.replay.obtenirSnapshot(),
      delivery: this.delivery.obtenirSnapshot(),
      preferences: this.preferences.obtenirSnapshot(),
      observability: this.observability.obtenirSnapshot(),
    };
  }
}
