import assert from 'node:assert/strict';
import test from 'node:test';
import { CacheConfigurationEffective } from 'shared/configuration';

test('le cache effectif supporte une charge locale simple sans ralentissement excessif', () => {
  const cache = new CacheConfigurationEffective(60_000);

  const commenceLe = Date.now();
  for (let index = 0; index < 500; index += 1) {
    cache.memoriser(`scope:${index}`, {
      scope: { niveau: 'SYSTEM' },
      valeurs: [],
    });
  }
  for (let index = 0; index < 500; index += 1) {
    assert.equal(cache.lire(`scope:${index}`)?.scope.niveau, 'SYSTEM');
  }
  const dureeMs = Date.now() - commenceLe;

  assert.ok(dureeMs < 250, `cache trop lent: ${dureeMs}ms`);
});
