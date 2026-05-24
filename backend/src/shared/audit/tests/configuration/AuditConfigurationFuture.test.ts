import assert from 'node:assert/strict';
import test from 'node:test';
import { AuditConfigurationFacade } from 'shared/audit/infrastructure/configuration';
import { AuditConfigurationIntegrationOrchestrator } from 'shared/audit/integration';
import {
  attendrePropagationAsync,
  creerConfigurationScope,
  reinitialiserEtatAuditTests,
} from '../support/AuditTestSupport';

test('la configuration Audit publie versioning propagation rollback et policies critiques', async () => {
  reinitialiserEtatAuditTests();
  const facade = new AuditConfigurationFacade();
  const scope = creerConfigurationScope();

  const snapshot = facade.enregistrer(
    scope,
    {
      monitoring: { alertLimit: 10 },
      retry: { retryLimit: 7 },
      queues: { limiteParQueue: 20 },
    },
    {
      auteur: 'cto-tests',
      correlationId: 'corr-config',
      requestId: 'req-config',
      organisationId: 'org-a',
      ecoleId: 'ecole-a',
    },
  );

  facade.rollback(snapshot.version, {
    auteur: 'cto-tests',
    correlationId: 'corr-config-rollback',
    requestId: 'req-config-rollback',
  });

  await attendrePropagationAsync();

  const integration = new AuditConfigurationIntegrationOrchestrator().capturerSnapshot();
  assert.ok(integration.monitoring.totalEvents >= 4);
  assert.ok(integration.monitoring.retryChanges >= 1);
  assert.ok(integration.monitoring.monitoringChanges >= 1);
  assert.ok(integration.monitoring.workerQueueChanges >= 1);
  assert.ok(integration.monitoring.rollbackEvents >= 1);
});
