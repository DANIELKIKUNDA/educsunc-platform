import assert from 'node:assert/strict';
import test from 'node:test';
import { WorkerObservabilityMonitoring } from '../../../monitoring';
import { FIXTURE_MONITORING_CONTEXT } from '../fixtures/MonitoringFixtures';

test('WorkerObservabilityMonitoring lit un snapshot d observabilite exploitable', async () => {
  const worker = new WorkerObservabilityMonitoring();
  const resultat = await worker.executer({
    contexte: { ...FIXTURE_MONITORING_CONTEXT },
  });
  const snapshot = resultat.resultat as {
    traces: readonly unknown[];
    capacites: readonly unknown[];
    saturations: readonly unknown[];
  };

  assert.equal(resultat.worker, 'OBSERVABILITY');
  assert.equal(resultat.succes, true);
  assert.ok(Array.isArray(snapshot.traces));
  assert.ok(Array.isArray(snapshot.capacites));
  assert.ok(Array.isArray(snapshot.saturations));
});
