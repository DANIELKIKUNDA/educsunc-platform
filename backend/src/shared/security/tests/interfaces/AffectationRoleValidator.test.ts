import test from 'node:test';
import assert from 'node:assert/strict';
import { ValidationError } from 'shared/exceptions/ValidationError';
import { CreerAffectationUtilisateurValidator } from 'shared/security/interfaces/http/validators';

test('role obligatoire, utilisateur obligatoire et scope metier minimal present', () => {
  assert.throws(() => CreerAffectationUtilisateurValidator.valider({ idRole: 'role-1', niveauAcces: 'ECOLE' }), ValidationError);
  assert.throws(() => CreerAffectationUtilisateurValidator.valider({ idUtilisateur: 'u1', niveauAcces: 'ECOLE' }), ValidationError);

  const resultat = CreerAffectationUtilisateurValidator.valider({
    idUtilisateur: 'u1',
    idRole: 'role-1',
    niveauAcces: 'ECOLE',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
  });
  assert.equal(resultat.idRole, 'role-1');
});
