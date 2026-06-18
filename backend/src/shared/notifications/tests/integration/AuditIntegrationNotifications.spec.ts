import assert from 'node:assert/strict';
import test from 'node:test';
import { NotificationsAuditIntegrationOrchestrator } from 'shared/notifications';
import { obtenirNotificationAuditMemoryStore } from '../../integration/audit/store/NotificationAuditMemoryStore';

test('le pont audit publie un enregistrement memoire exploitable', async () => {
  obtenirNotificationAuditMemoryStore().records.length = 0;
  const orchestrateur = new NotificationsAuditIntegrationOrchestrator();

  await orchestrateur.publier({
    name: 'NotificationSent',
    payload: {
      providerLatencyMs: 250,
    },
    notificationContext: {
      notificationId: 'notification-1',
      canal: 'EMAIL',
      organisationId: 'org-1',
      ecoleId: 'ecole-1',
      requestId: 'req-1',
      correlationId: 'corr-1',
      requestedAt: new Date().toISOString(),
    },
  });

  const snapshot = orchestrateur.obtenirSnapshot();
  assert.equal(obtenirNotificationAuditMemoryStore().records.length, 1);
  assert.ok(snapshot.monitoring.totalEvents >= 0);
});
