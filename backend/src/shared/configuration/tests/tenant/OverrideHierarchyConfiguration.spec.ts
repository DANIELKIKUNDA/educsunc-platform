import assert from 'node:assert/strict';
import test from 'node:test';
import { ConfigurationScope } from 'shared/configuration';
import { FIXTURE_SCOPE_ECOLE, FIXTURE_SCOPE_SYSTEME, FIXTURE_SCOPE_UTILISATEUR } from '../fixtures/ConfigurationFixtures';

test('la hierarchie de portee suit SYSTEM < SCHOOL < USER', () => {
  const system = ConfigurationScope.creer(FIXTURE_SCOPE_SYSTEME);
  const school = ConfigurationScope.creer(FIXTURE_SCOPE_ECOLE);
  const user = ConfigurationScope.creer(FIXTURE_SCOPE_UTILISATEUR);

  assert.equal(school.peutSurcharger(system), true);
  assert.equal(user.peutSurcharger(school), true);
});
