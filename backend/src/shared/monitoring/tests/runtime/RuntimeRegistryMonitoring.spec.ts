import assert from 'node:assert/strict';
import test from 'node:test';
import { MonitoringRuntimeFactory } from '../factories/MonitoringRuntimeFactory';

test('RuntimeMonitoringRegistry conserve les compteurs de coordination', () => {
  const runtime = MonitoringRuntimeFactory.creer();
  const snapshot = runtime.registry.snapshot();

  assert.equal(snapshot.demarre, true);
  assert.ok(snapshot.schedulerCount >= 2);
  assert.ok(snapshot.workerCount >= 2);
});
