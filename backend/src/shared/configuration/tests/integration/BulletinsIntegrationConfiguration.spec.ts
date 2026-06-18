import assert from 'node:assert/strict';
import test from 'node:test';
import { ConfigurationBulletinsIntegrationOrchestrator } from 'shared/configuration';

test('le pont Bulletins memorise une projection de bulletin', async () => {
  const orchestrateur = new ConfigurationBulletinsIntegrationOrchestrator();
  await orchestrateur.consommer({
    type: 'BULLETIN_PUBLIE',
    bulletinId: 'bulletin-1',
    contexte: {
      configurationId: 'config-1',
      scopeLevel: 'ECOLE',
      organisationId: 'org-1',
      ecoleId: 'ecole-1',
      changedAt: new Date().toISOString(),
    },
  });

  assert.equal(orchestrateur.snapshot().totalEvenements, 1);
});
