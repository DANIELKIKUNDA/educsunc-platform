import assert from 'node:assert/strict';
import test from 'node:test';
import { ConfigurationTestSupport } from '../support/ConfigurationTestSupport';

test('ReloadRuntimeConfigurationUseCase declenche un reload force', async () => {
  const env = ConfigurationTestSupport.creerUseCases();

  await env.reloadUseCase.executer({
    configurationId: 'config-command-1',
    forcer: true,
  });

  assert.equal(env.reload.appels[0]?.forcer, true);
});
