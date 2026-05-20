import assert from 'node:assert/strict';
import test from 'node:test';
import { GlobalTestBootstrap } from '../setup/GlobalTestBootstrap';
import { ROLE_FIXTURES, TENANT_FIXTURES } from '../fixtures/GlobalFixtures';
import { executerEnParallele, mesurerDuree } from '../helpers/GlobalTestHelpers';

test('la charge de login reste stable sur un lot parallelise raisonnable', async () => {
  const bootstrap = new GlobalTestBootstrap();
  const acteur = await bootstrap.creerActeur({ ...ROLE_FIXTURES.ADMIN_ECOLE, organisationId: TENANT_FIXTURES.organisationA, ecoleId: TENANT_FIXTURES.ecoleA1 });
  const duree = await mesurerDuree(async () => {
    await executerEnParallele(25, () =>
      bootstrap.obtenirLoginUseCase().executer({
        email: acteur.email,
        motDePasse: 'secret',
        organisationActiveId: TENANT_FIXTURES.organisationA,
        ecoleActiveId: TENANT_FIXTURES.ecoleA1,
      }));
  });
  assert.ok(duree < 5000, `Charge login trop lente: ${duree} ms`);
});
