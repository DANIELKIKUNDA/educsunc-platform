import assert from 'node:assert/strict';
import test from 'node:test';
import { PresentateurHttpValidationConfiguration } from 'shared/configuration';

test('le presentateur HTTP de validation conserve la projection applicative', () => {
  const resultat = PresentateurHttpValidationConfiguration.presenter({
    valide: false,
    warnings: ['warning'],
  });

  assert.equal(resultat.warnings[0], 'warning');
});
