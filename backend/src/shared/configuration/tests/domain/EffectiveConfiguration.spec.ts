import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ConfigurationKey,
  ConfigurationScope,
  ConfigurationValue,
  ServiceCalculConfigurationEffective,
} from 'shared/configuration';
import { FIXTURE_SCOPE_ECOLE, FIXTURE_SCOPE_SYSTEME } from '../fixtures/ConfigurationFixtures';

test('la resolution effective retient la valeur la plus specifique compatible', () => {
  const service = new ServiceCalculConfigurationEffective();
  const resultat = service.calculer(
    ConfigurationScope.creer(FIXTURE_SCOPE_ECOLE),
    [
      {
        key: ConfigurationKey.creer('runtime.retry.max'),
        scope: ConfigurationScope.creer(FIXTURE_SCOPE_SYSTEME),
        value: ConfigurationValue.creer(3),
        verrouille: false,
      },
      {
        key: ConfigurationKey.creer('runtime.retry.max'),
        scope: ConfigurationScope.creer(FIXTURE_SCOPE_ECOLE),
        value: ConfigurationValue.creer(7),
        verrouille: false,
      },
    ],
  );

  assert.equal(resultat.lire('runtime.retry.max')?.valeur(), 7);
});
