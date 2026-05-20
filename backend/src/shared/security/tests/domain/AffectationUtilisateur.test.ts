import test from 'node:test';
import assert from 'node:assert/strict';
import { AffectationUtilisateur, ErreurAffectationExpiree, ErreurAffectationInvalide } from 'shared/security/domain';
import { creerAffectationUtilisateur } from '../support/SecurityTestSupport';

test('doit affecter utilisateur a role, organisation et ecole avec periode active', () => {
  const affectation = creerAffectationUtilisateur();

  assert.equal(affectation.obtenirIdUtilisateur(), 'utilisateur-1');
  assert.equal(affectation.obtenirIdOrganisation(), 'org-1');
  assert.equal(affectation.obtenirIdEcole(), 'ecole-1');
  assert.ok(affectation.obtenirDateDebut() instanceof Date);
});

test('refuse affectation ecole hors organisation et affectation cours sans classe', () => {
  assert.throws(() => AffectationUtilisateur.creer({
    idUtilisateur: 'u1',
    idRole: 'role-1',
    niveauAcces: 'ECOLE',
    idEcole: 'ecole-1',
  }), ErreurAffectationInvalide);
  assert.throws(() => creerAffectationUtilisateur({ idClasse: undefined, idCours: 'cours-1' }), ErreurAffectationInvalide);
});

test('refuse affectation expiree lors de la verification de portee', () => {
  const affectation = creerAffectationUtilisateur();
  affectation.expirer(new Date(Date.now() - 60_000));

  assert.throws(() => affectation.verifierPortee(), ErreurAffectationExpiree);
});
