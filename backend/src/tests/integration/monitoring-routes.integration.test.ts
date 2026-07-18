import assert from 'node:assert/strict';
import test from 'node:test';
import Fastify from 'fastify';
import { requestContextPlugin } from '../../app/plugins/request-context.plugin';
import { tenancyPlugin } from '../../app/plugins/tenancy.plugin';
import { routeMonitoring } from '../../app/routes/monitoring.routes';
import { ROLE_FIXTURES, TENANT_FIXTURES } from '../../shared/tests/fixtures/GlobalFixtures';
import { injecterCommeActeur } from '../../shared/tests/helpers/GlobalTestHelpers';
import { GlobalTestBootstrap } from '../../shared/tests/setup/GlobalTestBootstrap';

test('les routes monitoring exposent les lectures et mutations aux acteurs plateforme reels', async () => {
  const bootstrap = new GlobalTestBootstrap();
  const manager = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.MANAGER_SYSTEME,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });
  const operateur = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.OPERATEUR_SYSTEME,
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
    await bootstrap.creerSecurityPlugin()(instance, {});
    await tenancyPlugin(instance, {});
    await instance.register(routeMonitoring);
  });

  const etatManager = await injecterCommeActeur(serveur, manager, {
    method: 'GET',
    url: '/api/v1/monitoring/state',
  });
  assert.equal(etatManager.statusCode, 200, etatManager.body);

  const observabiliteSupport = await injecterCommeActeur(serveur, support, {
    method: 'GET',
    url: '/api/v1/monitoring/observability',
  });
  assert.equal(observabiliteSupport.statusCode, 200, observabiliteSupport.body);

  const incidentOperateur = await injecterCommeActeur(serveur, operateur, {
    method: 'POST',
    url: '/api/v1/monitoring/incidents',
    payload: {
      incidentId: 'incident-1',
      resume: 'Incident monitoring de test',
      niveau: 'CRITICAL',
    },
  });
  assert.equal(incidentOperateur.statusCode, 201, incidentOperateur.body);

  const incidentSupportRefuse = await injecterCommeActeur(serveur, support, {
    method: 'POST',
    url: '/api/v1/monitoring/incidents',
    payload: {
      incidentId: 'incident-2',
      resume: 'Incident refuse',
      niveau: 'CRITICAL',
    },
  });
  assert.equal(incidentSupportRefuse.statusCode, 403, incidentSupportRefuse.body);

  const monitoringAdminEcole = await injecterCommeActeur(serveur, adminEcole, {
    method: 'GET',
    url: '/api/v1/monitoring/state',
  });
  assert.equal(monitoringAdminEcole.statusCode, 403, monitoringAdminEcole.body);

  await serveur.close();
});
