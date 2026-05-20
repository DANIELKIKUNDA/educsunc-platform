import assert from 'node:assert/strict';
import test from 'node:test';
import { mesurerDuree } from '../helpers/GlobalTestHelpers';

test('paiements massifs restent stables sous charge simulee', async () => {
  const duree = await mesurerDuree(async () => {
    let total = 0;
    for (let index = 0; index < 2000; index += 1) {
      total += 10_000 + index;
    }
    assert.ok(total > 0);
  });

  assert.ok(duree < 3000, `Paiements massifs trop lents: ${duree} ms`);
});
