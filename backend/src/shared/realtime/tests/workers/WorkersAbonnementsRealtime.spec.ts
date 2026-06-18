import assert from 'node:assert/strict';
import test from 'node:test';
import { WorkerAbonnementsRealtime } from 'shared/realtime';
import { RealtimeCommandFactory } from '../factories/RealtimeCommandFactory';

test('WorkerAbonnementsRealtime abonne une connexion et projette l abonnement', async () => {
  const worker = new WorkerAbonnementsRealtime();
  const resultat = await worker.executer(RealtimeCommandFactory.abonnement());
  const abonnement = resultat.resultat as { id: string };

  assert.equal(resultat.worker, 'SUBSCRIPTIONS');
  assert.equal(resultat.succes, true);
  assert.equal(abonnement.id, 'sub-1');
});
