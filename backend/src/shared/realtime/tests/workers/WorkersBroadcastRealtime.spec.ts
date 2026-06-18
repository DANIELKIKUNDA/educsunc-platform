import assert from 'node:assert/strict';
import test from 'node:test';
import { WorkerDiffusionRealtime } from 'shared/realtime';
import { RealtimeCommandFactory } from '../factories/RealtimeCommandFactory';

test('WorkerDiffusionRealtime execute une diffusion realtime', async () => {
  const worker = new WorkerDiffusionRealtime();
  const resultat = await worker.executer(RealtimeCommandFactory.publication());
  assert.equal(resultat.worker, 'BROADCAST');
  assert.equal(resultat.succes, true);
});
