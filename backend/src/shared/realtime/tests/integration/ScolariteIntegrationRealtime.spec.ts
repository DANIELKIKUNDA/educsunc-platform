import assert from 'node:assert/strict';
import test from 'node:test';
import { RealtimeScolariteIntegrationOrchestrator } from 'shared/realtime';

test('RealtimeScolariteIntegrationOrchestrator relaie un evenement metier vers realtime', async () => {
  const orchestrateur = new RealtimeScolariteIntegrationOrchestrator();

  await orchestrateur.publier({
    type: 'EleveAffecte',
    audience: ['user-sco-1'],
    organisationId: 'org-sco',
    ecoleId: 'ecole-sco',
    payload: { eleveId: 'eleve-1' },
  });

  const snapshot = orchestrateur.snapshot();
  assert.equal(snapshot.totalMessages >= 1, true);
  assert.equal(snapshot.messages.at(-1)?.type, 'EleveAffecte');
});
