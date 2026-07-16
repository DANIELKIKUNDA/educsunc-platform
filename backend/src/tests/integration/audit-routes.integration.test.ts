import assert from 'node:assert/strict';
import test from 'node:test';
import Fastify from 'fastify';
import { auditPlugin } from '../../app/plugins/audit.plugin';
import { requestContextPlugin } from '../../app/plugins/request-context.plugin';
import { securityPlugin } from '../../app/plugins/security.plugin';
import { tenancyPlugin } from '../../app/plugins/tenancy.plugin';
import { routeAudit } from '../../app/routes/audit.routes';
import { ROLE_FIXTURES, TENANT_FIXTURES } from '../../shared/tests/fixtures/GlobalFixtures';
import { injecterCommeActeur } from '../../shared/tests/helpers/GlobalTestHelpers';
import { GlobalTestBootstrap } from '../../shared/tests/setup/GlobalTestBootstrap';

test('les routes Audit ouvrent la lecture de base aux acteurs systeme reels et refusent un acteur ecole', async () => {
  const bootstrap = new GlobalTestBootstrap();
  const manager = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.MANAGER_SYSTEME,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });
  const support = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.SUPPORT_SYSTEME,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });
  const adminEcole = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.ADMIN_ECOLE,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });

  const serveur = Fastify();
  await serveur.register(async (instance) => {
    await requestContextPlugin(instance, {});
    await bootstrap.creerAuthenticationPlugin()(instance, {});
    await securityPlugin(instance, {});
    await tenancyPlugin(instance, {});
    await auditPlugin(instance, {});
    await instance.register(routeAudit);
  });

  const listeManager = await injecterCommeActeur(serveur, manager, {
    method: 'GET',
    url: '/api/v1/audit',
  });
  assert.equal(listeManager.statusCode, 200, listeManager.body);

  const timelineSupport = await injecterCommeActeur(serveur, support, {
    method: 'GET',
    url: '/api/v1/audit/timeline',
  });
  assert.equal(timelineSupport.statusCode, 200, timelineSupport.body);

  const listeAdminEcole = await injecterCommeActeur(serveur, adminEcole, {
    method: 'GET',
    url: '/api/v1/audit',
  });
  assert.equal(listeAdminEcole.statusCode, 403, listeAdminEcole.body);

  await serveur.close();
});
