import type { NotificationAuditRecord } from '../NotificationsAuditIntegrationTypes';

type NotificationAuditState = {
  records: NotificationAuditRecord[];
};

const state: NotificationAuditState = {
  records: [],
};

export function obtenirNotificationAuditMemoryStore(): NotificationAuditState {
  return state;
}
