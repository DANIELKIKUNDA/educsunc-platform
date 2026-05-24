import assert from 'node:assert/strict';
import test from 'node:test';
import { creerAuditRuntime } from '../../../../app/plugins/audit-runtime';
import { reinitialiserEtatAuditTests } from '../support/AuditTestSupport';

test('le runtime Audit expose toutes les integrations critiques du document', () => {
  reinitialiserEtatAuditTests();
  const runtime = creerAuditRuntime();

  assert.ok(runtime.integrationEventBus);
  assert.ok(runtime.workersIntegration);
  assert.ok(runtime.synchronizationIntegration);
  assert.ok(runtime.monitoringIntegration);
  assert.ok(runtime.notificationsIntegration);
  assert.ok(runtime.configurationIntegration);
  assert.ok(runtime.monitoring.health);
  assert.ok(runtime.monitoring.metrics);
  assert.ok(runtime.routesDependances.auditController);
});
