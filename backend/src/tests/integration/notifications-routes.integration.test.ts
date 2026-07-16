import assert from 'node:assert/strict';
import test from 'node:test';
import Fastify from 'fastify';
import { requestContextPlugin } from '../../app/plugins/request-context.plugin';
import { securityPlugin } from '../../app/plugins/security.plugin';
import { tenancyPlugin } from '../../app/plugins/tenancy.plugin';
import { reinitialiserNotificationsRuntime } from '../../app/plugins/notifications-runtime';
import { routeNotifications } from '../../app/routes/notifications.routes';
import { ROLE_FIXTURES, TENANT_FIXTURES } from '../../shared/tests/fixtures/GlobalFixtures';
import { injecterCommeActeur } from '../../shared/tests/helpers/GlobalTestHelpers';
import { GlobalTestBootstrap } from '../../shared/tests/setup/GlobalTestBootstrap';

test('les routes notifications ecole ouvrent la lecture et la creation aux acteurs ecole autorises et refusent les operations techniques au role non systeme', async () => {
  reinitialiserNotificationsRuntime();
  const bootstrap = new GlobalTestBootstrap();
  const adminSystemeEcole = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.ADMIN_SYSTEME_ECOLE,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });
  const adminEcole = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.ADMIN_ECOLE,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });
  const parent = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.PARENT,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });

  const serveur = Fastify();
  await serveur.register(async (instance) => {
    await requestContextPlugin(instance, {});
    await bootstrap.creerAuthenticationPlugin()(instance, {});
    await securityPlugin(instance, {});
    await tenancyPlugin(instance, {});
    await instance.register(routeNotifications);
  });

  const creation = await injecterCommeActeur(serveur, adminSystemeEcole, {
    method: 'POST',
    url: '/api/v1/notifications',
    payload: {
      type: 'INFORMATION_GENERALE',
      priorite: 'NORMAL',
      portee: 'USER',
      temporalite: 'IMMEDIATE',
      visibilite: 'PRIVATE',
      source: 'USER_ACTION',
      strategieLivraison: 'FALLBACK_CHAIN',
      canaux: ['IN_APP'],
      message: 'Notification de test',
      destinataires: [
        {
          destinataireId: 'destinataire-1',
          typeDestinataire: 'USER',
        },
      ],
    },
  });
  assert.equal(creation.statusCode, 201, creation.body);

  const listeAdminEcole = await injecterCommeActeur(serveur, adminEcole, {
    method: 'GET',
    url: '/api/v1/notifications',
  });
  assert.equal(listeAdminEcole.statusCode, 200, listeAdminEcole.body);

  const notificationId = creation.json().donnee.id;
  const retryAdminEcoleRefuse = await injecterCommeActeur(serveur, adminEcole, {
    method: 'POST',
    url: `/api/v1/notifications/${notificationId}/retry`,
    payload: {
      raison: 'Test retry refuse',
      action: 'PLANIFIER',
    },
  });
  assert.equal(retryAdminEcoleRefuse.statusCode, 403, retryAdminEcoleRefuse.body);

  const creationParentRefusee = await injecterCommeActeur(serveur, parent, {
    method: 'POST',
    url: '/api/v1/notifications',
    payload: {
      type: 'INFORMATION_GENERALE',
      priorite: 'NORMAL',
      portee: 'USER',
      temporalite: 'IMMEDIATE',
      visibilite: 'PRIVATE',
      source: 'USER_ACTION',
      strategieLivraison: 'FALLBACK_CHAIN',
      canaux: ['IN_APP'],
      message: 'Notification refusee',
      destinataires: [
        {
          destinataireId: 'destinataire-1',
          typeDestinataire: 'USER',
        },
      ],
    },
  });
  assert.equal(creationParentRefusee.statusCode, 403, creationParentRefusee.body);

  await serveur.close();
});

test('les routes notifications organisationnelles ouvrent la supervision aux acteurs organisationnels reels et refusent un acteur ecole', async () => {
  reinitialiserNotificationsRuntime();
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
    await bootstrap.creerAuthenticationPlugin()(instance, {});
    await securityPlugin(instance, {});
    await tenancyPlugin(instance, {});
    await instance.register(routeNotifications);
  });

  const vueTenantPromoteur = await injecterCommeActeur(serveur, promoteur, {
    method: 'GET',
    url: `/api/v1/admin/notifications/tenant?organisationId=${TENANT_FIXTURES.organisationA}&ecoleId=${TENANT_FIXTURES.ecoleA1}`,
  });
  assert.equal(vueTenantPromoteur.statusCode, 200, vueTenantPromoteur.body);

  const realtimeGestionnaire = await injecterCommeActeur(serveur, gestionnaire, {
    method: 'GET',
    url: '/api/v1/notifications/realtime-futur/capabilities',
  });
  assert.equal(realtimeGestionnaire.statusCode, 200, realtimeGestionnaire.body);

  const tenantAdminEcoleRefuse = await injecterCommeActeur(serveur, adminEcole, {
    method: 'GET',
    url: `/api/v1/admin/notifications/tenant?organisationId=${TENANT_FIXTURES.organisationA}&ecoleId=${TENANT_FIXTURES.ecoleA1}`,
  });
  assert.equal(tenantAdminEcoleRefuse.statusCode, 403, tenantAdminEcoleRefuse.body);

  await serveur.close();
});
