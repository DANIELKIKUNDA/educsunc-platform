import assert from 'node:assert/strict';
import test from 'node:test';
import { CacheConfigurationEffective } from 'shared/configuration';

test('CacheConfigurationEffective memorise puis invalide une entree', async () => {
  const cache = new CacheConfigurationEffective(10_000);

  cache.memoriser('scope:SYSTEM', {
    scope: { niveau: 'SYSTEM' },
    valeurs: [],
  });

  assert.equal(cache.lire('scope:SYSTEM')?.scope.niveau, 'SYSTEM');
  cache.invalider('scope:SYSTEM');
  assert.equal(cache.lire('scope:SYSTEM'), null);
});
