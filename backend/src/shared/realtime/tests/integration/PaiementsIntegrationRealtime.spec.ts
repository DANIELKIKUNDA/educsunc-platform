import assert from 'node:assert/strict';
import test from 'node:test';
import { RealtimePaiementsIntegrationOrchestrator } from 'shared/realtime';

test('RealtimePaiementsIntegrationOrchestrator relaie un evenement metier vers realtime', async () => {
  const orchestrateur = new RealtimePaiementsIntegrationOrchestrator();

  await orchestrateur.publier({
    type: 'FactureReglee',
    audience: ['user-pay-1'],
    organisationId: 'org-pay',
    ecoleId: 'ecole-pay',
    payload: { factureId: 'facture-1' },
  });

  const snapshot = orchestrateur.snapshot();
  assert.equal(snapshot.totalMessages >= 1, true);
  assert.equal(snapshot.messages.at(-1)?.type, 'FactureReglee');
});
