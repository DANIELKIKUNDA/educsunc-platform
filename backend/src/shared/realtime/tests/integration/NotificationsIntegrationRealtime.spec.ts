import assert from 'node:assert/strict';
import test from 'node:test';
import { RealtimeNotificationsIntegrationOrchestrator } from 'shared/realtime';

test('RealtimeNotificationsIntegrationOrchestrator publie une commande realtime', async () => {
  const orchestrateur = new RealtimeNotificationsIntegrationOrchestrator();
  await orchestrateur.publier({
    type: 'NotificationCreee',
    audience: ['user-1'],
    organisationId: 'org-1',
    ecoleId: 'ecole-1',
    payload: { titre: 'notification' },
  });
  const snapshot = orchestrateur.snapshot();
  assert.ok(snapshot.totalMessages >= 1);
});
