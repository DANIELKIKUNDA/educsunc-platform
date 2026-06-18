import assert from 'node:assert/strict';
import test from 'node:test';
import { MonitoringRuntimeFactory } from '../factories/MonitoringRuntimeFactory';
import { FIXTURE_MONITORING_CONTEXT } from '../fixtures/MonitoringFixtures';

test('le runtime Monitoring demarre et expose un registre coherent', async () => {
  const runtime = MonitoringRuntimeFactory.creer();
  const etat = await runtime.health.global.calculerEtat({ ...FIXTURE_MONITORING_CONTEXT });
  const snapshot = runtime.registry.snapshot();

  assert.equal(snapshot.demarre, true);
  assert.ok(snapshot.workerCount >= 2);
  assert.ok(etat.composants.length >= 1);
});
