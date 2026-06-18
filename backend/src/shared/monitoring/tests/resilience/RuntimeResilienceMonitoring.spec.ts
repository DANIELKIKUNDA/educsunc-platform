import assert from 'node:assert/strict';
import test from 'node:test';
import { InitialiseurRuntimeMonitoring } from '../../../monitoring';

test('le runtime Monitoring peut etre redemarre proprement', () => {
  const initialiseur = new InitialiseurRuntimeMonitoring();
  const runtimeA = initialiseur.initialiser();
  const runtimeB = initialiseur.initialiser();

  assert.equal(runtimeA.registry.snapshot().demarre, true);
  assert.equal(runtimeB.registry.snapshot().demarre, true);
});
