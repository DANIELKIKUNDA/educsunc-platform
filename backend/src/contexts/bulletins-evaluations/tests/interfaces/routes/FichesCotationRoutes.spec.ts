import test from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import { creerFichesCotationRoutes } from 'contexts/bulletins-evaluations/interfaces/http/routes/fiches-cotation.routes';
import { ContexteTenant } from 'shared/tenancy/TenantContext';

test('les routes fiches de cotation exposent la lecture unitaire et la lecture par classe cours annee', async () => {
  const serveur = Fastify();
  const contexteTenant = new ContexteTenant();

  await serveur.register(creerFichesCotationRoutes({
    fichesCotationController: {
      async consulterListe() {
        return { donnee: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } };
      },
      async consulterParId() {
        return { donnee: { idFicheCotationEleveCours: 'fiche-1' } };
      },
      async consulterParClasse() {
        return { donnee: [{ idFicheCotationEleveCours: 'fiche-1' }], meta: { page: 1, limit: 20, total: 1, totalPages: 1 } };
      },
    } as never,
    contexteTenant,
  } as never));

  assert.equal((await serveur.inject({
    method: 'GET',
    url: '/fiches-cotation/fiche-1',
    headers: { 'x-tenant-id': 'ecole-1', 'x-user-id': 'user-1' },
  })).statusCode, 200);

  assert.equal((await serveur.inject({
    method: 'GET',
    url: '/fiches-cotation/classe/classe-1?idReferentielCours=cours-1&idAnneeScolaire=annee-1',
    headers: { 'x-tenant-id': 'ecole-1', 'x-organisation-id': 'org-1', 'x-user-id': 'user-1' },
  })).statusCode, 200);

  await serveur.close();
});
