import assert from 'node:assert/strict';
import test from 'node:test';
import { WorkerDiagnosticsRealtime } from 'shared/realtime';

test('WorkerDiagnosticsRealtime retourne un diagnostic runtime exploitable', () => {
  const worker = new WorkerDiagnosticsRealtime();
  const resultat = worker.executer();
  const diagnostic = resultat.resultat as {
    totalSignaux: number;
    totalMessagesJournalises: number;
  };

  assert.equal(resultat.worker, 'DIAGNOSTICS');
  assert.equal(resultat.succes, true);
  assert.equal(typeof diagnostic.totalSignaux, 'number');
  assert.equal(typeof diagnostic.totalMessagesJournalises, 'number');
});
