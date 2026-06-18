import assert from 'node:assert/strict';
import test from 'node:test';
import { MonitoringRuntimeFactory } from '../factories/MonitoringRuntimeFactory';
import { FIXTURE_MONITORING_CONTEXT } from '../fixtures/MonitoringFixtures';

test('RuntimeObservabilityMonitoring lit un snapshot cohérent', async () => {
  const runtime = MonitoringRuntimeFactory.creer();
  const snapshot = await runtime.observability.global.lire({
    contexte: { ...FIXTURE_MONITORING_CONTEXT },
  });

  assert.ok(snapshot.etatSysteme.composants.length >= 1);
  assert.ok(Array.isArray(snapshot.traces));
});
