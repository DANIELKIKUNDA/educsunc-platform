import assert from 'node:assert/strict';
import test from 'node:test';
import { RealtimeReferentielIntegrationOrchestrator } from 'shared/realtime';

test('RealtimeReferentielIntegrationOrchestrator relaie un evenement metier vers realtime', async () => {
  const orchestrateur = new RealtimeReferentielIntegrationOrchestrator();

  await orchestrateur.publier({
    type: 'ReferentielMisAJour',
    audience: ['user-ref-1'],
    organisationId: 'org-ref',
    ecoleId: 'ecole-ref',
    payload: { codeCours: 'MATH-01' },
  });

  const snapshot = orchestrateur.snapshot();
  assert.equal(snapshot.totalMessages >= 1, true);
  assert.equal(snapshot.messages.at(-1)?.type, 'ReferentielMisAJour');
});
