import assert from 'node:assert/strict';
import test from 'node:test';
import { RealtimeMonitoringIntegrationOrchestrator } from 'shared/realtime';

test('RealtimeMonitoringIntegrationOrchestrator projette les signaux publies', async () => {
  const orchestrateur = new RealtimeMonitoringIntegrationOrchestrator();

  await orchestrateur.publier({
    type: 'notifications.realtime.diffused',
    canal: 'notifications',
    audience: 3,
  });

  const snapshot = orchestrateur.snapshot();
  assert.equal(snapshot.totalSignaux, 1);
  assert.equal(snapshot.dernierType, 'notifications:notifications.realtime.diffused');
});
