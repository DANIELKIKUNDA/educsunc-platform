import assert from 'node:assert/strict';
import test from 'node:test';
import { ConfigurationScope, ExceptionScopeInvalide } from 'shared/configuration';
import { FIXTURE_SCOPE_ECOLE, FIXTURE_SCOPE_SYSTEME } from '../fixtures/ConfigurationFixtures';

test('une portee SCHOOL valide expose sa priorite et peut surcharger SYSTEM', () => {
  const system = ConfigurationScope.creer(FIXTURE_SCOPE_SYSTEME);
  const school = ConfigurationScope.creer(FIXTURE_SCOPE_ECOLE);

  assert.equal(school.peutSurcharger(system), true);
  assert.equal(school.priorite() >= system.priorite(), true);
});

test('une portee USER incomplete est rejetee', () => {
  assert.throws(
    () => ConfigurationScope.creer({ niveau: 'USER', organisationId: 'org-1', ecoleId: 'ecole-1' }),
    ExceptionScopeInvalide,
  );
});

test('une portee USER de plateforme exige uniquement son utilisateur', () => {
  const scope = ConfigurationScope.creer({
    niveau: 'USER',
    utilisateurId: 'manager-systeme-1',
  });

  assert.deepEqual(scope.valeur(), {
    niveau: 'USER',
    utilisateurId: 'manager-systeme-1',
  });
});
