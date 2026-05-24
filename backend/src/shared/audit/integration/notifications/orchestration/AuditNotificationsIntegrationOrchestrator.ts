import { NotificationsAuditIntegrationOrchestrator } from 'shared/notifications';
import type { AuditNotificationsIntegrationSnapshot } from '../AuditNotificationsIntegrationTypes';

export class AuditNotificationsIntegrationOrchestrator {
  public constructor(
    private readonly notifications = new NotificationsAuditIntegrationOrchestrator(),
  ) {}

  public capturerSnapshot(): AuditNotificationsIntegrationSnapshot {
    return this.notifications.obtenirSnapshot();
  }
}
