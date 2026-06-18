import assert from 'node:assert/strict';
import test from 'node:test';
import { WorkerObservabiliteRealtime } from 'shared/realtime';

test('WorkerObservabiliteRealtime retourne un snapshot lisible d observabilite', () => {
  const worker = new WorkerObservabiliteRealtime();
  const resultat = worker.executer();
  const observabilite = resultat.resultat as {
    compteurs: object;
    signaux: readonly unknown[];
  };

  assert.equal(resultat.worker, 'OBSERVABILITY');
  assert.equal(resultat.succes, true);
  assert.ok(observabilite.compteurs);
  assert.ok(Array.isArray(observabilite.signaux));
});
