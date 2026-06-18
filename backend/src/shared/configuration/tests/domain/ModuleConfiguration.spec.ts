import assert from 'node:assert/strict';
import test from 'node:test';
import { ConfigurationFactory } from '../factories/ConfigurationFactory';

test('la modularite commerciale expose module et feature actives', () => {
  const moduleConfiguration = ConfigurationFactory.creerModuleConfiguration();

  assert.equal(moduleConfiguration.moduleActif('SCOLARITE_ELEVES'), true);
  assert.equal(moduleConfiguration.featureActive('SCOLARITE_ELEVES', 'RUNTIME_RELOAD'), true);
});
