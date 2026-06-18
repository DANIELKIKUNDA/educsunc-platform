import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ConfigurationKey,
  ConfigurationScope,
  ConfigurationValue,
  ServiceCalculConfigurationEffective,
} from 'shared/configuration';
import { FIXTURE_SCOPE_ECOLE, FIXTURE_SCOPE_SYSTEME } from '../fixtures/ConfigurationFixtures';

test('le calcul de configuration effective reste rapide sur un lot large mais local', () => {
  const service = new ServiceCalculConfigurationEffective();
  const target = ConfigurationScope.creer(FIXTURE_SCOPE_ECOLE);
  const entries = Array.from({ length: 250 }, (_, index) => ({
    key: ConfigurationKey.creer(`runtime.batch.${index}`),
    scope: ConfigurationScope.creer(index % 2 === 0 ? FIXTURE_SCOPE_SYSTEME : FIXTURE_SCOPE_ECOLE),
    value: ConfigurationValue.creer(index),
    verrouille: false,
  }));

  const commenceLe = Date.now();
  const resultat = service.calculer(target, entries);
  const dureeMs = Date.now() - commenceLe;

  assert.equal(resultat.details().valeurs.length, 250);
  assert.ok(dureeMs < 250, `resolution trop lente: ${dureeMs}ms`);
});
