import assert from 'node:assert/strict';
import test from 'node:test';
import { RechargeurRuntimeConfiguration } from 'shared/configuration';

test('RechargeurRuntimeConfiguration journalise les reloads', async () => {
  const rechargeur = new RechargeurRuntimeConfiguration();
  await rechargeur.rechargerConfigurationRuntime('config-1', true);

  assert.equal(rechargeur.journal()[0]?.force, true);
});

test('RechargeurRuntimeConfiguration appelle la synchronisation runtime fournie', async () => {
  const appels: Array<{ configurationId: string; force: boolean }> = [];
  const rechargeur = new RechargeurRuntimeConfiguration(async (configurationId, force) => {
    appels.push({ configurationId, force });
  });

  await rechargeur.rechargerConfigurationRuntime('config-2', false);

  assert.deepEqual(appels, [{ configurationId: 'config-2', force: false }]);
});
