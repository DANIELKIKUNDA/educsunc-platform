import test from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import { creerClassementsRoutes } from 'contexts/bulletins-evaluations/interfaces/http/routes/classements.routes';
import { ContexteTenant } from 'shared/tenancy/TenantContext';

test('les routes classements exposent consultation et recalcul', async () => {
  const serveur = Fastify();
  const contexteTenant = new ContexteTenant();

  await serveur.register(creerClassementsRoutes({
    classementsController: {
      async consulter() { return { donnee: { type: 'classement' } }; },
      async recalculer() { return { donnee: { ok: true } }; },
    } as never,
    contexteTenant,
  } as never));

  assert.equal((await serveur.inject({
    method: 'GET',
    url: '/classements/classe/classe-1?idAnneeScolaire=annee-1&codeColonne=TOTAL_GENERAL',
    headers: { 'x-tenant-id': 'ecole-1', 'x-user-id': 'user-1' },
  })).statusCode, 200);

  assert.equal((await serveur.inject({
    method: 'POST',
    url: '/classements/recalcul',
    headers: { 'x-tenant-id': 'ecole-1', 'x-user-id': 'user-1' },
    payload: {
      idClassePedagogique: 'classe-1',
      idAnneeScolaire: 'annee-1',
      codeColonne: 'TOTAL_GENERAL',
    },
  })).statusCode, 200);

  await serveur.close();
});
