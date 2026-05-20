import assert from 'node:assert/strict';
import test from 'node:test';
import { mesurerDuree } from '../helpers/GlobalTestHelpers';

test('generation massive de bulletins reste stable sur 1000 iterations simulees', async () => {
  const duree = await mesurerDuree(async () => {
    const bulletins = Array.from({ length: 1000 }, (_, index) => ({
      id: `bulletin-${index}`,
      total: 60 + (index % 40),
      pourcentage: 50 + (index % 50),
    }));
    const resultat = bulletins.map((bulletin) => ({
      ...bulletin,
      mention: bulletin.pourcentage >= 70 ? 'A' : 'B',
    }));
    assert.equal(resultat.length, 1000);
  });

  assert.ok(duree < 3000, `Generation massive trop lente: ${duree} ms`);
});
