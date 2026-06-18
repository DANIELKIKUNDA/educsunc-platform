import assert from 'node:assert/strict';
import test from 'node:test';
import { RealtimeAuthIntegrationOrchestrator } from 'shared/realtime';

test('RealtimeAuthIntegrationOrchestrator projette un contexte de session actif', async () => {
  const orchestrateur = new RealtimeAuthIntegrationOrchestrator();

  await orchestrateur.synchroniserEvenement({
    type: 'AUTH_CONTEXT_UPDATED',
    utilisateurId: 'user-auth-1',
    organisationId: 'org-auth',
    ecoleId: 'ecole-auth',
    permissions: ['notifications.read', 'realtime.connect'],
    sessionActive: true,
  });

  const snapshot = orchestrateur.snapshot();
  assert.equal(snapshot.sessionActive, true);
  assert.equal(snapshot.utilisateurId, 'user-auth-1');
  assert.deepEqual(snapshot.permissions, ['notifications.read', 'realtime.connect']);
});
