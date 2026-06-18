import assert from 'node:assert/strict';
import test from 'node:test';
import { ConfigurationFactory } from '../factories/ConfigurationFactory';

test('la configuration runtime conserve ses sous-blocs de pilotage', () => {
  const runtime = ConfigurationFactory.creerRuntimeConfiguration().valeur();

  assert.equal(runtime.retry.tentativesMaximales, 3);
  assert.equal(runtime.scheduler.actif, true);
});
