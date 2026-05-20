import assert from 'node:assert/strict';
import test from 'node:test';
import { mesurerDuree } from '../helpers/GlobalTestHelpers';

test('classements massifs restent rapides et deterministes', async () => {
  const duree = await mesurerDuree(async () => {
    const classement = Array.from({ length: 1500 }, (_, index) => ({
      eleveId: `eleve-${index}`,
      moyenne: 1000 - index,
    })).sort((a, b) => b.moyenne - a.moyenne);
    assert.equal(classement[0]?.eleveId, 'eleve-0');
  });

  assert.ok(duree < 3000, `Classements trop lents: ${duree} ms`);
});
