import assert from 'node:assert/strict';
import test from 'node:test';
import Fastify from 'fastify';
import { authenticationPlugin } from '../../app/plugins/authentication.plugin';
import { reinitialiserNotificationsRuntime } from '../../app/plugins/notifications-runtime';
import { requestContextPlugin } from '../../app/plugins/request-context.plugin';
import { securityPlugin } from '../../app/plugins/security.plugin';
import { tenancyPlugin } from '../../app/plugins/tenancy.plugin';
import { routeNotifications } from '../../app/routes/notifications.routes';
import { SharedDomainEventBusAdapter } from '../../app/adapters/SharedDomainEventBusAdapter';
import { BulletinGenere } from '../../contexts/bulletins-evaluations/domain/events/BulletinGenere';
import { PaiementValide } from '../../contexts/paiements-facturation/domain/events/PaiementValide';
import { EleveAbandonne } from '../../contexts/scolarite-eleves/domain/events/EleveAbandonne';
import { ROLE_FIXTURES, TENANT_FIXTURES } from '../../shared/tests/fixtures/GlobalFixtures';
import { injecterCommeActeur } from '../../shared/tests/helpers/GlobalTestHelpers';
import { GlobalTestBootstrap } from '../../shared/tests/setup/GlobalTestBootstrap';

test('un evenement paiements publie sur le bus partage cree une notification relisible via l API', async () => {
  reinitialiserNotificationsRuntime();
  const bootstrap = new GlobalTestBootstrap();
  const adminSystemeEcole = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.ADMIN_SYSTEME_ECOLE,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });

  const serveur = Fastify();
  await serveur.register(async (instance) => {
    await requestContextPlugin(instance, {});
    await authenticationPlugin(instance, {});
    await securityPlugin(instance, {});
    await tenancyPlugin(instance, {});
    await instance.register(routeNotifications);
  });

  await new SharedDomainEventBusAdapter().publier(
    [new PaiementValide('PAIEMENT-1', TENANT_FIXTURES.ecoleA1, 'ELEVE-1')],
    {
      organisationId: TENANT_FIXTURES.organisationA,
      ecoleId: TENANT_FIXTURES.ecoleA1,
      utilisateurId: 'CAISSIER-1',
    },
  );

  const reponse = await injecterCommeActeur(serveur, adminSystemeEcole, {
    method: 'GET',
    url: '/api/v1/notifications',
  });

  assert.equal(reponse.statusCode, 200, reponse.body);
  const liste = reponse.json().donnee.elements;
  assert.ok(liste.some((notification: { type: string }) => notification.type === 'PAIEMENT_RECU'));
  await serveur.close();
});

test('un evenement scolarite publie sur le bus partage cree une notification relisible via l API', async () => {
  reinitialiserNotificationsRuntime();
  const bootstrap = new GlobalTestBootstrap();
  const adminSystemeEcole = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.ADMIN_SYSTEME_ECOLE,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });

  const serveur = Fastify();
  await serveur.register(async (instance) => {
    await requestContextPlugin(instance, {});
    await authenticationPlugin(instance, {});
    await securityPlugin(instance, {});
    await tenancyPlugin(instance, {});
    await instance.register(routeNotifications);
  });

  await new SharedDomainEventBusAdapter().publier([
    new EleveAbandonne(
      TENANT_FIXTURES.organisationA,
      TENANT_FIXTURES.ecoleA1,
      'UTILISATEUR-1',
      'ELEVE-1',
    ),
  ]);

  const reponse = await injecterCommeActeur(serveur, adminSystemeEcole, {
    method: 'GET',
    url: '/api/v1/notifications',
  });

  assert.equal(reponse.statusCode, 200, reponse.body);
  const liste = reponse.json().donnee.elements;
  assert.ok(liste.some((notification: { type: string }) => notification.type === 'ABANDON'));
  await serveur.close();
});

test('un evenement bulletins publie sur le bus partage cree une notification relisible via l API', async () => {
  reinitialiserNotificationsRuntime();
  const bootstrap = new GlobalTestBootstrap();
  const adminSystemeEcole = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.ADMIN_SYSTEME_ECOLE,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });

  const serveur = Fastify();
  await serveur.register(async (instance) => {
    await requestContextPlugin(instance, {});
    await authenticationPlugin(instance, {});
    await securityPlugin(instance, {});
    await tenancyPlugin(instance, {});
    await instance.register(routeNotifications);
  });

  await new SharedDomainEventBusAdapter().publier(
    [new BulletinGenere('BULLETIN-1', 'ELEVE-1')],
    {
      organisationId: TENANT_FIXTURES.organisationA,
      ecoleId: TENANT_FIXTURES.ecoleA1,
      utilisateurId: 'UTILISATEUR-1',
    },
  );

  const reponse = await injecterCommeActeur(serveur, adminSystemeEcole, {
    method: 'GET',
    url: '/api/v1/notifications',
  });

  assert.equal(reponse.statusCode, 200, reponse.body);
  const liste = reponse.json().donnee.elements;
  assert.ok(liste.some((notification: { type: string }) => notification.type === 'BULLETIN_DISPONIBLE'));
  await serveur.close();
});
