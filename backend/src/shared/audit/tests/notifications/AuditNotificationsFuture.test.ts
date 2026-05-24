import assert from 'node:assert/strict';
import test from 'node:test';
import { NotificationsAuditIntegrationOrchestrator } from 'shared/notifications';
import { AuditNotificationsIntegrationOrchestrator } from 'shared/audit/integration';
import { creerNotificationContext, reinitialiserEtatAuditTests } from '../support/AuditTestSupport';

test('le pont notifications futures conserve queue worker delivery retry et replay', async () => {
  reinitialiserEtatAuditTests();
  const notifications = new NotificationsAuditIntegrationOrchestrator();

  await notifications.publier({
    name: 'NotificationQueued',
    payload: { sujet: 'Bienvenue' },
    notificationContext: creerNotificationContext(),
  });
  await notifications.publier({
    name: 'NotificationRetried',
    payload: { raison: 'timeout-provider' },
    notificationContext: {
      ...creerNotificationContext({ notificationId: 'notification-1' }),
      retryCount: 2,
    },
  });
  await notifications.publier({
    name: 'NotificationDelivered',
    payload: { providerMessageId: 'provider-1' },
    notificationContext: {
      ...creerNotificationContext({ notificationId: 'notification-1' }),
      deliveredAt: '2026-05-24T10:05:00.000Z',
    },
  });

  const snapshot = new AuditNotificationsIntegrationOrchestrator().capturerSnapshot();
  assert.equal(snapshot.monitoring.queued, 1);
  assert.equal(snapshot.monitoring.retried, 1);
  assert.equal(snapshot.monitoring.delivered, 1);
});
