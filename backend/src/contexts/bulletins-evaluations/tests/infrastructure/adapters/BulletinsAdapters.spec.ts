import test from 'node:test';
import assert from 'node:assert/strict';
import { BulletinCacheAdapter } from 'contexts/bulletins-evaluations/infrastructure/adapters/BulletinCacheAdapter';
import { BulletinTenantResolver } from 'contexts/bulletins-evaluations/infrastructure/tenancy/BulletinTenantResolver';
import { CacheMemoire } from '../../mocks/BulletinsEvaluationsMocks';
import { creerContexteTenant } from '../../shared/BulletinsEvaluationsTestUtils';

// Ce fichier couvre les adaptateurs locaux relies a shared ou au contexte tenant.
test('les adaptateurs techniques relaient bien leurs dependances', async () => {
  const cacheShared = new CacheMemoire();
  const adapterCache = new BulletinCacheAdapter(cacheShared);
  await adapterCache.enregistrer('cle-1', { valeur: 1 }, 30);
  assert.deepEqual(await adapterCache.obtenir('cle-1'), { valeur: 1 });
  await adapterCache.invalider('cle-1');
  assert.equal(await adapterCache.obtenir('cle-1'), null);

  const resolver = new BulletinTenantResolver(creerContexteTenant('ecole-9', 'org-9'));
  assert.equal(resolver.obtenirIdEcoleCourante(), 'ecole-9');
  assert.equal(resolver.obtenirIdOrganisationCourante(), 'org-9');
});
