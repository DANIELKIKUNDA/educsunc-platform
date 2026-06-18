import assert from 'node:assert/strict';
import test from 'node:test';
import { ValidateConfigurationUseCase } from 'shared/configuration';

test('ValidateConfigurationUseCase retourne les warnings applicatifs attendus', async () => {
  const useCase = new ValidateConfigurationUseCase();

  const resultat = await useCase.executer({
    key: 'runtime.mode',
    value: 'texte',
  });

  assert.equal(resultat.valide, false);
  assert.equal(resultat.warnings.length > 0, true);
});
