import assert from 'node:assert/strict';
import test from 'node:test';
import { RealtimeSynchronisationIntegrationOrchestrator } from 'shared/realtime';

test('RealtimeSynchronisationIntegrationOrchestrator accumule les synchronisations traitees', async () => {
  const orchestrateur = new RealtimeSynchronisationIntegrationOrchestrator();
  const avant = orchestrateur.snapshot().totalSynchronisations;

  await orchestrateur.synchroniserEvenement({
    type: 'SYNC_COMPLETED',
    organisationId: 'org-sync',
    ecoleId: 'ecole-sync',
    payload: { source: 'notifications' },
  });

  const snapshot = orchestrateur.snapshot();
  assert.equal(snapshot.dernierEtat, 'SYNC_COMPLETED');
  assert.equal(snapshot.totalSynchronisations, avant + 1);
});
