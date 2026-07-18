import assert from 'node:assert/strict';
import test from 'node:test';
import { MonitoringAuditIntegrationOrchestrator } from 'shared/monitoring';

test('MonitoringAuditIntegrationOrchestrator consolide une observation runtime exploitable', async () => {
  const orchestrateur = new MonitoringAuditIntegrationOrchestrator();

  orchestrateur.enregistrerObservationHttp({
    requestId: 'req-monitoring-1',
    correlationId: 'corr-monitoring-1',
    traceId: 'trace-monitoring-1',
    spanId: 'span-monitoring-1',
    organisationId: 'org-monitoring-1',
    ecoleId: 'ecole-monitoring-1',
    startedAt: new Date().toISOString(),
    durationMs: 120,
    route: '/monitoring/health',
    method: 'GET',
    statusCode: 200,
  });

  const snapshot = await orchestrateur.obtenirSnapshot();
  const observation = snapshot.observations.at(-1);

  assert.ok(observation);
  assert.equal(observation?.requestId, 'req-monitoring-1');
  assert.equal(observation?.correlationId, 'corr-monitoring-1');
  assert.ok(snapshot.forensic);
  assert.ok(Array.isArray(snapshot.observations));
});
