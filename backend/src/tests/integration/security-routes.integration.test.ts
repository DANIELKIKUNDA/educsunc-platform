import assert from 'node:assert/strict';
import test from 'node:test';
import Fastify from 'fastify';
import { authenticationPlugin } from '../../app/plugins/authentication.plugin';
import { requestContextPlugin } from '../../app/plugins/request-context.plugin';
import { securityPlugin } from '../../app/plugins/security.plugin';
import { tenancyPlugin } from '../../app/plugins/tenancy.plugin';
import { routeSecurity } from '../../app/routes/security.routes';
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
    await authenticationPlugin(instance, {});
    await securityPlugin(instance, {});
    await tenancyPlugin(instance, {});
    await instance.register(routeSecurity);
  });

  const listeRoles = await injecterCommeActeur(serveur, managerSecurity, {
    method: 'GET',
    url: '/api/v1/security/roles',
  });
  assert.equal(listeRoles.statusCode, 200, listeRoles.body);

  const creationRole = await injecterCommeActeur(serveur, managerSecurity, {
    method: 'POST',
    url: '/api/v1/security/roles',
    payload: {
      codeRole: 'COMPTABLE',
      nomRole: 'Comptable',
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

  await serveur.close();
});
