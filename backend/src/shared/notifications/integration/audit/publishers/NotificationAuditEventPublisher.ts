import { obtenirSharedEventBus } from 'shared/infrastructure/bus';
import type { NotificationAuditPublishRequest } from '../NotificationsAuditIntegrationTypes';
import { NotificationAuditContextMapper } from '../mappers/NotificationAuditContextMapper';
import { obtenirNotificationAuditMemoryStore } from '../store/NotificationAuditMemoryStore';

export class NotificationAuditEventPublisher {
  private readonly bus = obtenirSharedEventBus();

  public async publier(request: NotificationAuditPublishRequest) {
    obtenirNotificationAuditMemoryStore().records.push({
      name: request.name,
      notificationId: request.notificationContext.notificationId,
      canal: request.notificationContext.canal,
      provider: request.notificationContext.provider,
      queueName: request.notificationContext.queueName,
      workerId: request.notificationContext.workerId,
      correlationId: request.notificationContext.correlationId,
      requestId: request.notificationContext.requestId,
      organisationId: request.notificationContext.organisationId,
      ecoleId: request.notificationContext.ecoleId,
      replayId: request.notificationContext.replayId,
      retryCount: request.notificationContext.retryCount ?? 0,
      occurredAt: request.notificationContext.requestedAt,
    });

    return this.bus.publier(
      request.name,
      {
        notificationId: request.notificationContext.notificationId,
        canal: request.notificationContext.canal,
        provider: request.notificationContext.provider,
        queueName: request.notificationContext.queueName,
        workerId: request.notificationContext.workerId,
        targetDeviceId: request.notificationContext.targetDeviceId,
        deliveredAt: request.notificationContext.deliveredAt,
        ...request.payload,
      },
      NotificationAuditContextMapper.versMetadata(request.notificationContext),
    );
  }
}
