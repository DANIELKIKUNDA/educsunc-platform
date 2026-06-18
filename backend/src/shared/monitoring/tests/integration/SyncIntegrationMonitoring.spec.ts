import assert from 'node:assert/strict';
import test from 'node:test';
import { MonitoringSyncIntegrationOrchestrator } from '../../../monitoring';

test('MonitoringSyncIntegrationOrchestrator consolide un snapshot sync', async () => {
  const orchestrator = new MonitoringSyncIntegrationOrchestrator();
  await orchestrator.synchroniserEvenement({
    type: 'sync-job',
    resourceId: 'resource-sync-1',
    statut: 'FAILED',
  });

  const snapshot = orchestrator.snapshot();
  assert.equal(snapshot.length, 1);
  assert.equal(snapshot[0]?.score, 100);
});
