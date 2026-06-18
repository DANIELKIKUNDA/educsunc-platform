import test from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import { creerStatistiquesRoutes } from 'contexts/bulletins-evaluations/interfaces/http/routes/statistiques.routes';
import { ContexteTenant } from 'shared/tenancy/TenantContext';

test('les routes statistiques exposent classes, ecole, non-classes et abandons', async () => {
  const serveur = Fastify();
  const contexteTenant = new ContexteTenant();

  await serveur.register(creerStatistiquesRoutes({
    statistiquesBulletinController: {
      async consulterClasses() { return { donnee: { type: 'classe' } }; },
      async consulterEcole() { return { donnee: { type: 'ecole' } }; },
      async consulterNonClasses() { return { donnee: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } }; },
      async consulterAbandons() { return { donnee: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } }; },
    } as never,
    contexteTenant,
  } as never));

  assert.equal((await serveur.inject({
    method: 'GET',
    url: '/statistiques/classes?idClassePedagogique=classe-1&idAnneeScolaire=annee-1&codeColonne=TOTAL_GENERAL',
    headers: { 'x-tenant-id': 'ecole-1', 'x-user-id': 'user-1' },
  })).statusCode, 200);

  assert.equal((await serveur.inject({
    method: 'GET',
    url: '/statistiques/ecole?idEcole=ecole-1&idAnneeScolaire=annee-1&codeColonne=TOTAL_GENERAL',
    headers: { 'x-tenant-id': 'ecole-1', 'x-user-id': 'user-1' },
  })).statusCode, 200);

  assert.equal((await serveur.inject({
    method: 'GET',
    url: '/statistiques/non-classes?idClassePedagogique=classe-1&idAnneeScolaire=annee-1&codeColonne=TOTAL_GENERAL',
    headers: { 'x-tenant-id': 'ecole-1', 'x-user-id': 'user-1' },
  })).statusCode, 200);

  assert.equal((await serveur.inject({
    method: 'GET',
    url: '/statistiques/abandons?idClassePedagogique=classe-1&idAnneeScolaire=annee-1',
    headers: { 'x-tenant-id': 'ecole-1', 'x-user-id': 'user-1' },
  })).statusCode, 200);

  await serveur.close();
});
