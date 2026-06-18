import assert from 'node:assert/strict';
import test from 'node:test';
import { ConfigurationTestSupport } from '../support/ConfigurationTestSupport';

test('PropagateConfigurationUseCase declenche la propagation technique', async () => {
  const env = ConfigurationTestSupport.creerUseCases();

  await env.propagateUseCase.executer({
    configurationId: 'config-command-1',
    canauxCibles: ['notifications'],
  });

  assert.equal(env.propagation.propagations.length, 1);
});
