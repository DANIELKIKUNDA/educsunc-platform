import test from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import { creerHistoriqueRoutes } from 'contexts/bulletins-evaluations/interfaces/http/routes/historique.routes';
import { ContexteTenant } from 'shared/tenancy/TenantContext';

test("les routes d'historique exposent les lectures reelles du BC", async () => {
  const serveur = Fastify();
  const contexteTenant = new ContexteTenant();

  await serveur.register(creerHistoriqueRoutes({
    historiqueBulletinController: {
      async consulterHistoriqueBulletins() { return { donnee: [] }; },
      async consulterHistoriqueProclamations() { return { donnee: [] }; },
      async consulterSnapshots() { return { donnee: [] }; },
    } as never,
    contexteTenant,
  } as never));

  assert.equal((await serveur.inject({
    method: 'GET',
    url: '/historique/bulletins/bulletin-1',
  })).statusCode, 200);

  assert.equal((await serveur.inject({
    method: 'GET',
    url: '/historique/proclamations?idClassePedagogique=classe-1&idAnneeScolaire=annee-1',
  })).statusCode, 200);

  assert.equal((await serveur.inject({
    method: 'GET',
    url: '/historique/snapshots?idResultatBulletinEleve=resultat-1',
  })).statusCode, 200);

  await serveur.close();
});
