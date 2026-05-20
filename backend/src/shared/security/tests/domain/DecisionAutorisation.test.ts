import test from 'node:test';
import assert from 'node:assert/strict';
import { CodeRestrictionMetier, MoteurAutorisation, PermissionRole, PermissionSecurite, RestrictionRole } from 'shared/security/domain';

test('autorise acces valide et journalise refus permission absente, scope invalide et restriction metier', () => {
  const moteur = new MoteurAutorisation();
  const permissions = [PermissionRole.creer(new PermissionSecurite('bulletins.read'))];
  const restrictions = [RestrictionRole.creer(new CodeRestrictionMetier('INTERDICTION_BULLETINS'))];

  const valide = moteur.verifierPermission(permissions, [], 'bulletins.read', true);
  assert.equal(valide.decision.estAutorise(), true);

  const absente = moteur.verifierPermission([], [], 'bulletins.read', true);
  assert.equal(absente.decision.estAutorise(), false);
  assert.equal(absente.evenements[0]?.constructor.name, 'PermissionRefusee');

  const scopeInvalide = moteur.verifierPermission(permissions, [], 'bulletins.read', false);
  assert.equal(scopeInvalide.decision.estAutorise(), false);
  assert.equal(scopeInvalide.evenements[0]?.constructor.name, 'ScopeRefuse');

  const restriction = moteur.verifierPermission(permissions, restrictions, 'bulletins.read', true);
  assert.equal(restriction.decision.estAutorise(), false);
  assert.equal(restriction.evenements[0]?.constructor.name, 'RestrictionMetierDetectee');
});
