import assert from 'node:assert/strict';
import test from 'node:test';
import { ConfigurationFactory } from '../factories/ConfigurationFactory';
import { ConfigurationKey, ConfigurationOverride, ConfigurationScope, ConfigurationValue, ExceptionOverrideInterdit } from 'shared/configuration';
import { FIXTURE_SCOPE_ECOLE } from '../fixtures/ConfigurationFixtures';

test('l agregat Configuration historise une mise a jour metier', () => {
  const configuration = ConfigurationFactory.creer();

  const warnings = configuration.mettreAJour(
    ConfigurationValue.creer(9),
    ConfigurationFactory.creerChangement('UPDATED'),
  );

  assert.equal(configuration.details().statut, 'ACTIVE');
  assert.equal(configuration.details().totalVersions, 1);
  assert.equal(warnings.length, 0);
});

test('une configuration non overridable refuse la surcharge', () => {
  const configuration = ConfigurationFactory.creer({ overridable: false });

  assert.throws(
    () => configuration.appliquerOverride(
      new ConfigurationOverride({
        key: ConfigurationKey.creer('runtime.retry.max'),
        scope: ConfigurationScope.creer(FIXTURE_SCOPE_ECOLE),
        value: ConfigurationValue.creer(15),
        actorId: 'actor-2',
        overrideLe: new Date(),
      }),
    ),
    ExceptionOverrideInterdit,
  );
});
