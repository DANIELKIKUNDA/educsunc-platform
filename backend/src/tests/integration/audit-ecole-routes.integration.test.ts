import assert from 'node:assert/strict';
import test from 'node:test';
import Fastify from 'fastify';
import { authenticationPlugin } from '../../app/plugins/authentication.plugin';
import { auditPlugin } from '../../app/plugins/audit.plugin';
import { requestContextPlugin } from '../../app/plugins/request-context.plugin';
import { securityPlugin } from '../../app/plugins/security.plugin';
import { tenancyPlugin } from '../../app/plugins/tenancy.plugin';
import { routeAudit } from '../../app/routes/audit.routes';
import { ROLE_FIXTURES, TENANT_FIXTURES } from '../../shared/tests/fixtures/GlobalFixtures';
import { injecterCommeActeur } from '../../shared/tests/helpers/GlobalTestHelpers';
import { GlobalTestBootstrap } from '../../shared/tests/setup/GlobalTestBootstrap';

test('les routes d audit administratif et financier ecole ouvrent la lecture aux acteurs ecole reels et refusent un acteur pedagogique simple', async () => {
  const bootstrap = new GlobalTestBootstrap();
  const adminEcole = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.ADMIN_ECOLE,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });
  const caissier = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.CAISSIER,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });
  const directeurEtudes = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.DIRECTEUR_ETUDES,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });

  const serveur = Fastify();
  await serveur.register(async (instance) => {
    await requestContextPlugin(instance, {});
    await authenticationPlugin(instance, {});
    await securityPlugin(instance, {});
    await tenancyPlugin(instance, {});
    await auditPlugin(instance, {});
    await instance.register(routeAudit);
  });

  const listeAdminEcole = await injecterCommeActeur(serveur, adminEcole, {
    method: 'GET',
    url: '/api/v1/ecole/audit/administratif-financier',
  });
  assert.equal(listeAdminEcole.statusCode, 200, listeAdminEcole.body);

  const timelineCaissier = await injecterCommeActeur(serveur, caissier, {
    method: 'GET',
    url: '/api/v1/ecole/audit/administratif-financier/timeline',
  });
  assert.equal(timelineCaissier.statusCode, 200, timelineCaissier.body);

  const listeDirecteurEtudes = await injecterCommeActeur(serveur, directeurEtudes, {
    method: 'GET',
    url: '/api/v1/ecole/audit/administratif-financier',
  });
  assert.equal(listeDirecteurEtudes.statusCode, 403, listeDirecteurEtudes.body);

  await serveur.close();
});
