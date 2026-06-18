import assert from 'node:assert/strict';
import test from 'node:test';
import { RealtimeConfigurationIntegrationOrchestrator } from 'shared/realtime';

test('RealtimeConfigurationIntegrationOrchestrator applique une politique realtime', async () => {
  const orchestrateur = new RealtimeConfigurationIntegrationOrchestrator();
  await orchestrateur.synchroniserEvenement({
    type: 'REALTIME_CONFIGURATION_UPDATED',
    canauxAutorises: ['notifications', 'monitoring'],
    offlineFirst: true,
  });
  const snapshot = orchestrateur.snapshot();
  assert.equal(snapshot.offlineFirst, true);
  assert.deepEqual(snapshot.canauxAutorises, ['notifications', 'monitoring']);
});
