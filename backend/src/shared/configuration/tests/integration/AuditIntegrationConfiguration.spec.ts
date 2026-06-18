import assert from 'node:assert/strict';
import test from 'node:test';
import { ConfigurationAuditIntegrationOrchestrator } from 'shared/configuration';
import { obtenirConfigurationAuditMemoryStore } from '../../integration/audit/store/ConfigurationAuditMemoryStore';

test('le pont audit Configuration publie un enregistrement memoire exploitable', async () => {
  obtenirConfigurationAuditMemoryStore().records.length = 0;
  const orchestrateur = new ConfigurationAuditIntegrationOrchestrator();

  await orchestrateur.publier({
    name: 'ConfigurationMonitoringPolicyChanged',
    payload: {
      seuil: 'critical',
    },
    configurationContext: {
      configurationId: 'config-1',
      scopeLevel: 'ECOLE',
      organisationId: 'org-1',
      ecoleId: 'ecole-1',
      actorId: 'user-1',
      requestId: 'req-1',
      correlationId: 'corr-1',
      previousVersion: 'v1',
      nextVersion: 'v2',
      retryCount: 1,
      changedAt: new Date().toISOString(),
    },
  });

  const snapshot = orchestrateur.obtenirSnapshot();
  const record = obtenirConfigurationAuditMemoryStore().records.at(-1);

  assert.equal(obtenirConfigurationAuditMemoryStore().records.length, 1);
  assert.equal(record?.configurationId, 'config-1');
  assert.equal(record?.scopeLevel, 'ECOLE');
  assert.equal(snapshot.monitoring.totalEvents, 1);
  assert.equal(snapshot.monitoring.monitoringChanges, 1);
});
