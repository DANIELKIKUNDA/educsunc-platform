import test from 'node:test';
import assert from 'node:assert/strict';
import { LoginValidator } from 'shared/auth/interfaces/http/validators/LoginValidator';

test('email obligatoire et password obligatoire', () => {
  assert.throws(() => LoginValidator.valider({ motDePasse: 'secret' }, {}));
  assert.throws(() => LoginValidator.valider({ email: 'jean@test.cd' }, {}));
});

test('email invalide refuse', () => {
  assert.throws(() => LoginValidator.valider({ email: 'mauvais', motDePasse: 'secret' }, {}));
});
