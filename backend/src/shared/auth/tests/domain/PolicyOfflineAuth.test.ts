import test from 'node:test';
import assert from 'node:assert/strict';
import { ErreurAuthentificationOfflineInterdite, PolicyOfflineAuth } from 'shared/auth/domain';

test('auth offline valide acceptee', () => {
  assert.doesNotThrow(() => PolicyOfflineAuth.verifier(true, true));
});

test('auth offline corrompue ou interdite refusee', () => {
  assert.throws(() => PolicyOfflineAuth.verifier(false, true), ErreurAuthentificationOfflineInterdite);
});
