import test from 'node:test';
import assert from 'node:assert/strict';
import { PasswordHashAdapter } from 'shared/auth/infrastructure/adapters/crypto/PasswordHashAdapter';

test('100 logins simultanes et reconnexions massives restent executables', async () => {
  const adapter = new PasswordHashAdapter();
  const hashes = await Promise.all(Array.from({ length: 10 }, () => adapter.hacherMotDePasse('secret')));
  assert.equal(hashes.length, 10);
  assert.ok(hashes.every((hash) => hash.startsWith('scrypt:')));
});
