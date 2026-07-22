import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import Fastify from 'fastify';
import { requestContextPlugin } from '../../app/plugins/request-context.plugin';
import { tenancyPlugin } from '../../app/plugins/tenancy.plugin';
import { routeSecurity } from '../../app/routes/security.routes';
import { obtenirClientPostgresAuth } from '../../shared/auth/infrastructure/persistence/postgres/ClientPoolPostgresAuth';
import { TENANT_FIXTURES } from '../../shared/tests/fixtures/GlobalFixtures';
import { injecterCommeActeur } from '../../shared/tests/helpers/GlobalTestHelpers';
import { GlobalTestBootstrap } from '../../shared/tests/setup/GlobalTestBootstrap';

const PERMISSIONS_GOUVERNANCE_SECURITY = [
  'roles.read',
  'roles.write',
  'permissions.read',
  'permissions.write',
  'utilisateurs.read',
  'utilisateurs.write',
  'audit.security.read',
];

function materialiserChemin(chemin: string): string {
  return chemin.replace(/:([A-Za-z0-9_]+)/g, 'identifiant-falsifie');
}

type MethodeInjection = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';

test('toute la surface HTTP security reste privee et ses lectures refusent un acteur sans permission', async () => {
  const bootstrap = new GlobalTestBootstrap();
  const acteurSansPermission = await bootstrap.creerActeur({
    codeRole: 'CUSTOM_AUDITEUR_TEST',
    niveauAcces: 'PLATEFORME',
    permissions: ['bulletins.read'],
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });
  const routes: Array<{ method: MethodeInjection; url: string }> = [];
  const serveur = Fastify();
  serveur.addHook('onRoute', (route) => {
    const methods = Array.isArray(route.method) ? route.method : [route.method];
    for (const method of methods) {
      const methode = String(method).toUpperCase();
      if (route.url.startsWith('/api/v1/security') && ['GET','POST','PUT','PATCH','DELETE','OPTIONS','HEAD'].includes(methode)) {
        routes.push({ method: methode as MethodeInjection, url: route.url });
      }
    }
  });
  await serveur.register(async (instance) => {
    await requestContextPlugin(instance, {});
    await bootstrap.creerAuthenticationPlugin()(instance, {});
    await bootstrap.creerSecurityPlugin()(instance, {});
    await tenancyPlugin(instance, {});
    await instance.register(routeSecurity);
  });

  const routesUniques = [...new Map(routes.map((route) => [`${route.method} ${route.url}`, route])).values()];
  assert.ok(routesUniques.length >= 50, `${routesUniques.length} routes Security seulement ont ete capturees.`);
  for (const route of routesUniques) {
    const reponse = await serveur.inject({ method: route.method, url: materialiserChemin(route.url) });
    assert.equal(reponse.statusCode, 401, `${route.method} ${route.url} doit refuser une requete anonyme: ${reponse.body}`);
    assert.doesNotMatch(reponse.body, /access.?token|refresh.?token|mot.?de.?passe|password|secret/i);
  }

  const lectures = routesUniques.filter((route) => route.method === 'GET');
  assert.ok(lectures.length >= 10, 'La surface de lecture Security capturee est incomplete.');
  for (const route of lectures) {
    const reponse = await injecterCommeActeur(serveur, acteurSansPermission, {
      method: 'GET',
      url: materialiserChemin(route.url),
    });
    assert.equal(reponse.statusCode, 403, `GET ${route.url} doit refuser un acteur sans permission: ${reponse.body}`);
    assert.doesNotMatch(reponse.body, /access.?token|refresh.?token|mot.?de.?passe|password|secret/i);
  }

  await serveur.close();
});

test('les routes security sont exposees et reservees a la gouvernance plateforme', async () => {
  const bootstrap = new GlobalTestBootstrap();
  const managerSecurity = await bootstrap.creerActeur({
    codeRole: 'MANAGER_SYSTEME',
    niveauAcces: 'PLATEFORME',
    permissions: [...PERMISSIONS_GOUVERNANCE_SECURITY],
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });
  const adminEcole = await bootstrap.creerActeur({
    codeRole: 'ADMINISTRATEUR_ECOLE',
    niveauAcces: 'ECOLE',
    permissions: [...PERMISSIONS_GOUVERNANCE_SECURITY],
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });

  const serveur = Fastify();
  await serveur.register(async (instance) => {
    await requestContextPlugin(instance, {});
    await bootstrap.creerAuthenticationPlugin()(instance, {});
    await bootstrap.creerSecurityPlugin()(instance, {});
    await tenancyPlugin(instance, {});
    await instance.register(routeSecurity);
  });

  const annulationTest = new Error('ANNULATION_TRANSACTION_TEST_SECURITY');
  try {
    await obtenirClientPostgresAuth().dansTransaction(async () => {
  const listeRoles = await injecterCommeActeur(serveur, managerSecurity, {
    method: 'GET',
    url: '/api/v1/security/roles',
  });
  assert.equal(listeRoles.statusCode, 200, listeRoles.body);

  const codeRoleTest = `CUSTOM_TEST_${randomUUID().replaceAll('-', '').slice(0, 8).toUpperCase()}`;
  const creationRole = await injecterCommeActeur(serveur, managerSecurity, {
    method: 'POST',
    url: '/api/v1/security/roles',
    payload: {
      codeRole: codeRoleTest,
      nomRole: 'Rôle d’intégration',
      niveauAcces: 'ECOLE',
      permissions: ['paiements.read'],
      creePar: managerSecurity.utilisateurId,
      estSysteme: false,
    },
  });
  assert.equal(creationRole.statusCode, 201, creationRole.body);

  const auditSecurity = await injecterCommeActeur(serveur, managerSecurity, {
    method: 'GET',
    url: '/api/v1/security/audit/logs',
  });
  assert.equal(auditSecurity.statusCode, 200, auditSecurity.body);

  const refusEcole = await injecterCommeActeur(serveur, adminEcole, {
    method: 'GET',
    url: '/api/v1/security/roles',
  });
  assert.equal(refusEcole.statusCode, 403, refusEcole.body);

      throw annulationTest;
    });
  } catch (erreur) {
    if (erreur !== annulationTest) throw erreur;
  } finally {
    await serveur.close();
  }
});
