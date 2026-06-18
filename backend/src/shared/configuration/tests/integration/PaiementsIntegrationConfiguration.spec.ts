import assert from 'node:assert/strict';
import test from 'node:test';
import { ConfigurationPaiementsIntegrationOrchestrator } from 'shared/configuration';

test('le pont Paiements memorise une projection de facturation', async () => {
  const orchestrateur = new ConfigurationPaiementsIntegrationOrchestrator();
  await orchestrateur.consommer({
    type: 'PLAN_FACTURATION_CHANGE',
    compteFacturationId: 'compte-1',
    contexte: {
      configurationId: 'config-1',
      scopeLevel: 'ORGANISATION',
      organisationId: 'org-1',
      changedAt: new Date().toISOString(),
    },
  });

  assert.equal(orchestrateur.snapshot().totalEvenements, 1);
});
