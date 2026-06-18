import assert from 'node:assert/strict';
import test from 'node:test';
import { ConfigurationSecurityIntegrationOrchestrator } from 'shared/configuration';

test('le pont Security journalise un incident en absence d actorId', async () => {
  const orchestrateur = new ConfigurationSecurityIntegrationOrchestrator();

  const decision = await orchestrateur.evaluer({
    type: 'CONFIG_CHANGE',
    contexte: {
      configurationId: 'config-1',
      scopeLevel: 'ECOLE',
      changedAt: new Date().toISOString(),
    },
    metadata: {},
  });

  assert.equal(decision.autorise, false);
  assert.equal(orchestrateur.snapshot().totalIncidents, 1);
});
