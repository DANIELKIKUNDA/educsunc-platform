import assert from 'node:assert/strict';
import test from 'node:test';
import { RechargeurRuntimeConfiguration } from 'shared/configuration';

test('RechargeurRuntimeConfiguration journalise les reloads', async () => {
  const rechargeur = new RechargeurRuntimeConfiguration();
  await rechargeur.rechargerConfigurationRuntime('config-1', true);

  assert.equal(rechargeur.journal()[0]?.force, true);
});
