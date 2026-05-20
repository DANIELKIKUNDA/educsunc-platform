import assert from 'node:assert/strict';
import test from 'node:test';
import { ResolveurConflit } from 'shared/infrastructure/sync/ConflictResolver';
import { ConcurrencyService } from 'shared/infrastructure/concurrency/ConcurrencyService';

test('la synchronisation offline de cotation gere conflit et concurrence', () => {
  const resolveur = new ResolveurConflit();
  const serviceConcurrence = new ConcurrencyService();

  assert.equal(resolveur.detecterConflit({ version: 1 }, { version: 2 }), true);
  const resolution = resolveur.resoudreParFusionSimple({ cote: 10, version: 1 }, { cote: 12, version: 2 });
  assert.equal(resolution.strategie, 'FUSION_SIMPLE');
  assert.doesNotThrow(() => serviceConcurrence.verifierVersion(2, 2));
  assert.throws(() => serviceConcurrence.verifierVersion(2, 3));
});
