import assert from 'node:assert/strict';
import test from 'node:test';
import { NotificationAuditEventPublisher } from 'shared/notifications';
import { AuditTraceService } from 'shared/audit/infrastructure/monitoring';
import { creerNotificationContext, reinitialiserEtatAuditTests } from '../support/AuditTestSupport';

test('la chronology Audit conserve correlation request replay et retry dans les traces distribuees', async () => {
  reinitialiserEtatAuditTests();
  await new NotificationAuditEventPublisher().publier({
    name: 'NotificationReplayTriggered',
    payload: { originalNotificationId: 'notification-originale' },
    notificationContext: {
      ...creerNotificationContext(),
      replayId: 'replay-1',
      replayReason: 'RECOVERY',
      retryCount: 3,
    },
  });

  const traces = new AuditTraceService().lister();
  assert.equal(traces.length, 1);
  assert.equal(traces[0]?.replayId, 'replay-1');
  assert.equal(traces[0]?.requestId, 'req-notification');
  assert.equal(traces[0]?.correlationId, 'corr-notification');
  assert.equal(traces[0]?.retryCount, 3);
});
