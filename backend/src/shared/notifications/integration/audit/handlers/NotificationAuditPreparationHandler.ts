import type { NotificationAuditPublishRequest } from '../NotificationsAuditIntegrationTypes';

export class NotificationAuditPreparationHandler {
  public preparer(request: NotificationAuditPublishRequest): NotificationAuditPublishRequest {
    return {
      ...request,
      payload: {
        ...request.payload,
        notificationId: request.notificationContext.notificationId,
        canal: request.notificationContext.canal,
      },
    };
  }
}
