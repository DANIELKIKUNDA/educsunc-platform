import assert from 'node:assert/strict';
import test from 'node:test';
import { ConfigurationMonitoringIntegrationOrchestrator } from 'shared/configuration';

test('le pont Monitoring journalise une observation', async () => {
  const orchestrateur = new ConfigurationMonitoringIntegrationOrchestrator();
  await orchestrateur.enregistrer(
    'GENERAL',
    'INFO',
    'Configuration observee',
    {
      configurationId: 'config-1',
      scopeLevel: 'ECOLE',
      changedAt: new Date().toISOString(),
    },
  );

  assert.equal(orchestrateur.snapshot().totalObservations, 1);
});
