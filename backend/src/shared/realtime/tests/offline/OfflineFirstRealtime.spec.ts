import assert from 'node:assert/strict';
import test from 'node:test';
import { StrategieDegradationRealtime } from 'shared/realtime';

test('StrategieDegradationRealtime garde le mode degrade offline-first', () => {
  const resultat = new StrategieDegradationRealtime().appliquer(false);
  assert.equal(resultat.mode, 'DEGRADE');
  assert.equal(resultat.offlineFirstRespecte, true);
});
