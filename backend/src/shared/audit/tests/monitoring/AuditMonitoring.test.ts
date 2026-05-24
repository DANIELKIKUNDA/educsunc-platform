import assert from 'node:assert/strict';
import test from 'node:test';
import { AuditMonitoringIntegrationOrchestrator } from 'shared/audit/integration';
import { reinitialiserEtatAuditTests } from '../support/AuditTestSupport';

test('le monitoring Audit capture observations runtime et snapshot event-bus', () => {
  reinitialiserEtatAuditTests();
  const monitoring = new AuditMonitoringIntegrationOrchestrator();

  monitoring.enregistrerObservationHttp({
    requestId: 'req-monitoring',
    correlationId: 'corr-monitoring',
    traceId: 'trace-monitoring',
    spanId: 'span-monitoring',
    organisationId: 'org-a',
    ecoleId: 'ecole-a',
    startedAt: '2026-05-24T10:00:00.000Z',
    durationMs: 42,
    route: '/api/v1/audit',
    method: 'GET',
    statusCode: 200,
  });

  const snapshot = monitoring.capturerSnapshot();
  assert.equal(snapshot.monitoring.observations.length, 1);
  assert.equal(snapshot.monitoring.observations[0]?.durationMs, 42);
  assert.ok(Array.isArray(snapshot.monitoring.metrics));
  assert.equal(snapshot.eventBus.totalEvents, 0);
});
