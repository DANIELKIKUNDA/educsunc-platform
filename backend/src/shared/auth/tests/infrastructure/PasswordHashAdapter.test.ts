import test from 'node:test';
import assert from 'node:assert/strict';
import { PasswordHashAdapter } from 'shared/auth/infrastructure/adapters/crypto/PasswordHashAdapter';

test('hash mot de passe et verify mot de passe', async () => {
  const adapter = new PasswordHashAdapter();
  const hash = await adapter.hacherMotDePasse('secret');

  assert.notEqual(hash, 'secret');
  assert.equal(await adapter.verifierMotDePasse('secret', hash), true);
  assert.equal(await adapter.verifierMotDePasse('faux', hash), false);
});

test('hash different meme password', async () => {
  const adapter = new PasswordHashAdapter();
  const hash1 = await adapter.hacherMotDePasse('secret');
  const hash2 = await adapter.hacherMotDePasse('secret');

  assert.notEqual(hash1, hash2);
});
