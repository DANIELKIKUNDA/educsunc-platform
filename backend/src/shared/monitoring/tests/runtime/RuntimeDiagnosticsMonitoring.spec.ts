import assert from 'node:assert/strict';
import test from 'node:test';
import { MonitoringRuntimeFactory } from '../factories/MonitoringRuntimeFactory';
import { FIXTURE_MONITORING_CONTEXT } from '../fixtures/MonitoringFixtures';

test('RuntimeDiagnosticsMonitoring retourne un diagnostic consolidé', async () => {
  const runtime = MonitoringRuntimeFactory.creer();
  const diagnostic = await runtime.diagnostics.global.executer({ ...FIXTURE_MONITORING_CONTEXT });

  assert.ok(diagnostic.composants >= 1);
  assert.ok(diagnostic.dependances >= 1);
});
