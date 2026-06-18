import assert from 'node:assert/strict';
import test from 'node:test';
import { ConfigurationNotificationsIntegrationOrchestrator } from 'shared/configuration';

test('le pont Notifications publie un message de changement', async () => {
  const orchestrateur = new ConfigurationNotificationsIntegrationOrchestrator();
  await orchestrateur.notifier({
    type: 'CONFIG_CHANGED',
    audience: 'SCHOOL',
    message: 'Configuration modifiee',
    contexte: {
      configurationId: 'config-1',
      scopeLevel: 'ECOLE',
      changedAt: new Date().toISOString(),
    },
    metadata: {},
  });

  assert.equal(orchestrateur.snapshot().totalMessages, 1);
});
