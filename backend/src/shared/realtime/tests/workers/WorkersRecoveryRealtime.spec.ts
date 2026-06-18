import assert from 'node:assert/strict';
import test from 'node:test';
import { WorkerReconnexionRealtime, WorkerRecoveryRealtime } from 'shared/realtime';

test('WorkerReconnexionRealtime retourne un etat de reconnexion exploitable', () => {
  const worker = new WorkerReconnexionRealtime();
  const resultat = worker.executer();
  const reconnexion = resultat.resultat as {
    reconnexionAutorisee: boolean;
    checkedAt: string;
  };

  assert.equal(resultat.worker, 'RECONNECTION');
  assert.equal(resultat.succes, true);
  assert.equal(reconnexion.reconnexionAutorisee, true);
  assert.equal(typeof reconnexion.checkedAt, 'string');
});

test('WorkerRecoveryRealtime retourne un etat de recovery exploitable', () => {
  const worker = new WorkerRecoveryRealtime();
  const resultat = worker.executer();
  const recovery = resultat.resultat as {
    succes: boolean;
    restartedAt: string;
  };

  assert.equal(resultat.worker, 'RECOVERY');
  assert.equal(resultat.succes, true);
  assert.equal(recovery.succes, true);
  assert.equal(typeof recovery.restartedAt, 'string');
});
