import test from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import { creerConduiteRoutes } from 'contexts/bulletins-evaluations/interfaces/http/routes/conduite.routes';
import { ContexteTenant } from 'shared/tenancy/TenantContext';

test("les routes conduite exposent l'encodage et les lectures associees", async () => {
  const serveur = Fastify();
  const contexteTenant = new ContexteTenant();

  await serveur.register(creerConduiteRoutes({
    conduiteApplicationController: {
      async encoder() { return { donnee: { ok: true } }; },
      async consulterConduite() { return { donnee: [] }; },
      async consulterApplication() { return { donnee: [] }; },
    } as never,
    contexteTenant,
  } as never));

  assert.equal((await serveur.inject({
    method: 'POST',
    url: '/conduite',
    headers: { 'x-tenant-id': 'ecole-1', 'x-user-id': 'user-1' },
    payload: {
      idResultatBulletinEleve: 'resultat-1',
      codePeriode: 'P1',
      pointsConduite: 75,
    },
  })).statusCode, 200);

  assert.equal((await serveur.inject({
    method: 'GET',
    url: '/conduite/eleve-1',
    headers: { 'x-tenant-id': 'ecole-1', 'x-user-id': 'user-1' },
  })).statusCode, 200);

  assert.equal((await serveur.inject({
    method: 'GET',
    url: '/application/eleve-1',
    headers: { 'x-tenant-id': 'ecole-1', 'x-user-id': 'user-1' },
  })).statusCode, 200);

  await serveur.close();
});
