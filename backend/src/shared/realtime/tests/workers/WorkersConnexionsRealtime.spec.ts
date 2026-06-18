import assert from 'node:assert/strict';
import test from 'node:test';
import { WorkerConnexionsRealtime } from 'shared/realtime';
import { RealtimeCommandFactory } from '../factories/RealtimeCommandFactory';

test('WorkerConnexionsRealtime ouvre une connexion et met a jour son registre runtime', async () => {
  const worker = new WorkerConnexionsRealtime();
  const resultat = await worker.executer(RealtimeCommandFactory.connexion());
  const connexion = resultat.resultat as { id: string };

  assert.equal(resultat.worker, 'CONNECTIONS');
  assert.equal(resultat.succes, true);
  assert.equal(connexion.id, 'conn-1');
});
