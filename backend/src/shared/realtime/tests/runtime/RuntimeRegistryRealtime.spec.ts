import assert from 'node:assert/strict';
import test from 'node:test';
import { RealtimeRuntimeFactory } from '../factories/RealtimeRuntimeFactory';

test('le runtime Realtime demarre avec un registre coherent', () => {
  const runtime = RealtimeRuntimeFactory.creer();
  const snapshot = runtime.registry.snapshot();
  assert.equal(snapshot.demarre, true);
  assert.ok(snapshot.workerCount >= 2);
});
