import assert from 'node:assert/strict';
import test from 'node:test';
import { RealtimeRuntimeFactory } from '../factories/RealtimeRuntimeFactory';

test('RuntimeObservabiliteRealtime expose compteurs et signaux', () => {
  const runtime = RealtimeRuntimeFactory.creer();
  const resultat = runtime.observability.service.lire();
  assert.ok(resultat.compteurs);
  assert.ok(Array.isArray(resultat.signaux));
});
