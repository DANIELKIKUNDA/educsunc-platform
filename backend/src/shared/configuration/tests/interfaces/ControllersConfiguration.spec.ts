import assert from 'node:assert/strict';
import test from 'node:test';
import { ControleurValidationConfigurationHttp, ValidateConfigurationUseCase } from 'shared/configuration';

test('ControleurValidationConfigurationHttp enveloppe une reponse stable', async () => {
  const controleur = new ControleurValidationConfigurationHttp(new ValidateConfigurationUseCase());

  const reponse = await controleur.valider({
    body: { key: 'runtime.mode', value: 'texte' },
    headers: {},
    context: { correlationId: 'corr-1', requestId: 'req-1' },
  });

  assert.equal(reponse.succes, true);
  assert.equal(Array.isArray(reponse.donnees.warnings), true);
});
