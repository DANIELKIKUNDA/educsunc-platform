import assert from 'node:assert/strict';
import test from 'node:test';
import { ConfigurationScolariteIntegrationOrchestrator } from 'shared/configuration';

test('le pont Scolarite memorise une projection eleve', async () => {
  const orchestrateur = new ConfigurationScolariteIntegrationOrchestrator();
  await orchestrateur.consommer({
    type: 'INSCRIPTION_VALIDEE',
    eleveId: 'eleve-1',
    contexte: {
      configurationId: 'config-1',
      scopeLevel: 'ECOLE',
      ecoleId: 'ecole-1',
      changedAt: new Date().toISOString(),
    },
  });

  assert.equal(orchestrateur.snapshot().totalEvenements, 1);
});
