import assert from 'node:assert/strict';
import test from 'node:test';
import { ConfigurationRuntimeIntegrationOrchestrator } from 'shared/configuration';

test('le pont Runtime journalise un reload et une invalidation cache', async () => {
  const orchestrateur = new ConfigurationRuntimeIntegrationOrchestrator();
  const contexte = {
    configurationId: 'config-1',
    scopeLevel: 'ECOLE' as const,
    changedAt: new Date().toISOString(),
  };

  await orchestrateur.recharger('config-1', contexte, true);
  await orchestrateur.invaliderCache('config-1', contexte);

  assert.equal(orchestrateur.snapshot().totalSignals, 2);
});
