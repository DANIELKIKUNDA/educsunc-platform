import assert from 'node:assert/strict';
import test from 'node:test';
import { ConfigurationAuthIntegrationOrchestrator } from 'shared/configuration';

test('le pont Auth resout un contexte et autorise une action connue', async () => {
  const orchestrateur = new ConfigurationAuthIntegrationOrchestrator();
  await orchestrateur.synchroniserEvenement({
    type: 'PERMISSIONS_SYNC',
    utilisateurId: 'user-1',
    actionsAutorisees: ['configuration.update'],
    organisationId: 'org-1',
    ecoleId: 'ecole-1',
    estSuperAdmin: false,
  });

  const autorise = await orchestrateur.autoriser({
    action: 'configuration.update',
    utilisateurId: 'user-1',
    metadata: {},
  });

  assert.equal(autorise, true);
});
