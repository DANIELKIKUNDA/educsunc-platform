import assert from 'node:assert/strict';
import test from 'node:test';
import { FacadeInfrastructureConfiguration } from 'shared/configuration';

test('FacadeInfrastructureConfiguration consolide les diagnostics techniques', () => {
  const facade = new FacadeInfrastructureConfiguration();
  const diagnostic = facade.diagnostiquer();

  assert.equal(diagnostic.cache.length > 0, true);
  assert.equal(diagnostic.propagation.length > 0, true);
});
