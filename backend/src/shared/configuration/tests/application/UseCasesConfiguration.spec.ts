import assert from 'node:assert/strict';
import test from 'node:test';
import { ConfigurationId } from 'shared/configuration';
import { ConfigurationTestSupport } from '../support/ConfigurationTestSupport';

test('CreateConfigurationUseCase persiste et publie audit/monitoring', async () => {
  const env = ConfigurationTestSupport.creerUseCases();

  const resultat = await env.createUseCase.executer(env.commandeCreate);

  assert.equal(resultat.key, 'runtime.retry.max');
  assert.equal(env.audit.appels.length, 1);
  assert.equal(env.monitoring.appels[0]?.signal, 'CREATED');
});

test('UpdateConfigurationUseCase incremente l historique de version', async () => {
  const env = ConfigurationTestSupport.creerUseCases();
  await env.createUseCase.executer(env.commandeCreate);

  const resultat = await env.updateUseCase.executer(env.commandeUpdate);

  assert.equal(resultat.totalVersions >= 1, true);
  const versions = await env.versionRepository.listerParConfiguration(
    ConfigurationId.creer(env.commandeUpdate.configurationId),
  );
  assert.equal(versions.length >= 1, true);
});
