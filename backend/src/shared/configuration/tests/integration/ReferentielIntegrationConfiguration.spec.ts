import assert from 'node:assert/strict';
import test from 'node:test';
import { ConfigurationReferentielIntegrationOrchestrator } from 'shared/configuration';

test('le pont Referentiel memorise une projection lue depuis son ACL', async () => {
  const orchestrateur = new ConfigurationReferentielIntegrationOrchestrator();
  await orchestrateur.consommer({
    type: 'ECOLE_OUVERTE',
    referentielId: 'ref-1',
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
