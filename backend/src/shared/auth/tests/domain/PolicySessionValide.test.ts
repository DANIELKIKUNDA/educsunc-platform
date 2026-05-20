import test from 'node:test';
import assert from 'node:assert/strict';
import { ErreurSessionExpiree, ErreurSessionRevoquee, PolicySessionPersistante } from 'shared/auth/domain';

test('session valide acceptee', () => {
  assert.doesNotThrow(() => PolicySessionPersistante.verifier({ expireLe: new Date(Date.now() + 1000) }));
});

test('session expiree refusee', () => {
  assert.throws(() => PolicySessionPersistante.verifier({ expireLe: new Date(Date.now() - 1000) }), ErreurSessionExpiree);
});

test('session revoquee refusee', () => {
  assert.throws(() => PolicySessionPersistante.verifier({ revoqueeLe: new Date() }), ErreurSessionRevoquee);
});
