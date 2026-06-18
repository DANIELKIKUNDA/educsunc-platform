import assert from 'node:assert/strict';
import test from 'node:test';
import { RealtimeSecurityIntegrationOrchestrator } from 'shared/realtime';

test('RealtimeSecurityIntegrationOrchestrator projette une politique d audience', async () => {
  const orchestrateur = new RealtimeSecurityIntegrationOrchestrator();

  await orchestrateur.synchroniserEvenement({
    type: 'SECURITY_POLICY_UPDATED',
    autorise: false,
    scopes: ['org:org-sec', 'ecole:ecole-sec'],
    permissions: ['notifications.read'],
  });

  const snapshot = orchestrateur.snapshot();
  assert.equal(snapshot.autorise, false);
  assert.deepEqual(snapshot.scopes, ['org:org-sec', 'ecole:ecole-sec']);
  assert.deepEqual(snapshot.permissions, ['notifications.read']);
});
