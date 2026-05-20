import test from 'node:test';
import assert from 'node:assert/strict';
import { ValidationError } from 'shared/exceptions/ValidationError';
import { VerifierPermissionValidator } from 'shared/security/interfaces/http/validators';

test('permission obligatoire et permission valide acceptee', () => {
  assert.throws(() => VerifierPermissionValidator.valider({ idUtilisateur: 'u1' }), ValidationError);
  const resultat = VerifierPermissionValidator.valider({ idUtilisateur: 'u1', permissionDemandee: 'security.read' });
  assert.equal(resultat.permissionDemandee, 'security.read');
});
