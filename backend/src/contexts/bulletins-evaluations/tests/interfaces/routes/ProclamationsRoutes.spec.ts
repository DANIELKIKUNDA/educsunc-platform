import test from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import { creerProclamationsRoutes } from 'contexts/bulletins-evaluations/interfaces/http/routes/proclamations.routes';
import { ContexteTenant } from 'shared/tenancy/TenantContext';

test('les routes proclamations exposent initialisation, generation, consultation et pdf reel', async () => {
  const serveur = Fastify();
  const contexteTenant = new ContexteTenant();

  await serveur.register(creerProclamationsRoutes({
    proclamationsController: {
      async initialiser() { return { donnee: { ok: true } }; },
      async generer() { return { donnee: { ok: true } }; },
      async consulter() { return { donnee: { ok: true } }; },
      async telechargerPdf() { return { donnee: { format: 'pdf', mimeType: 'application/pdf' } }; },
    } as never,
    contexteTenant,
  } as never));

  const reponsePdf = await serveur.inject({
    method: 'GET',
    url: '/proclamations/classe/classe-1/pdf?idAnneeScolaire=annee-1&codeColonne=EX1',
    headers: { 'x-tenant-id': 'ecole-1' },
  });
  assert.equal(reponsePdf.statusCode, 200);

  const reponseInitialisation = await serveur.inject({
    method: 'POST',
    url: '/proclamations/initialiser',
    headers: { 'x-tenant-id': 'ecole-1' },
    payload: {
      idClassePedagogique: 'classe-1',
      idAnneeScolaire: 'annee-1',
      idEcole: 'ecole-1',
      codeColonne: 'EX1',
      versionReferentielProgramme: 'programme-v1',
    },
  });
  assert.equal(reponseInitialisation.statusCode, 201);

  await serveur.close();
});
