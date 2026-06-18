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

test('les routes d audit organisationnel ouvrent la lecture aux acteurs organisationnels reels et refusent un acteur ecole', async () => {
  const bootstrap = new GlobalTestBootstrap();
  const promoteur = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.PROMOTEUR_ORGANISATION,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });
  const gestionnaire = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.GESTIONNAIRE_ORGANISATION,
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
    await authenticationPlugin(instance, {});
    await securityPlugin(instance, {});
    await tenancyPlugin(instance, {});
    await auditPlugin(instance, {});
    await instance.register(routeAudit);
  });

  const monitoringPromoteur = await injecterCommeActeur(serveur, promoteur, {
    method: 'GET',
    url: '/api/v1/monitoring/health',
  });
  assert.equal(monitoringPromoteur.statusCode, 200, monitoringPromoteur.body);

  const analyticsGestionnaire = await injecterCommeActeur(serveur, gestionnaire, {
    method: 'GET',
    url: '/api/v1/analytics/audit',
  });
  assert.equal(analyticsGestionnaire.statusCode, 200, analyticsGestionnaire.body);

  const securityPromoteur = await injecterCommeActeur(serveur, promoteur, {
    method: 'GET',
    url: '/api/v1/security/incidents/incident-1',
  });
  assert.equal(securityPromoteur.statusCode, 200, securityPromoteur.body);

  const monitoringAdminEcole = await injecterCommeActeur(serveur, adminEcole, {
    method: 'GET',
    url: '/api/v1/monitoring/health',
  });
  assert.equal(monitoringAdminEcole.statusCode, 403, monitoringAdminEcole.body);

  await serveur.close();
});
