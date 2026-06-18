import test from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import { creerSynthesesRoutes } from 'contexts/bulletins-evaluations/interfaces/http/routes/syntheses.routes';
import { ContexteTenant } from 'shared/tenancy/TenantContext';

test('les routes syntheses exposent initialisation, consultation, generation et pdf', async () => {
  const serveur = Fastify();
  const contexteTenant = new ContexteTenant();

  await serveur.register(creerSynthesesRoutes({
    syntheseResultatsController: {
      async initialiser() { return { donnee: { ok: true } }; },
      async generer() { return { donnee: { ok: true } }; },
      async consulter() { return { donnee: { ok: true } }; },
      async telechargerPdf() { return { donnee: { format: 'pdf' } }; },
    } as never,
    contexteTenant,
  } as never));

  const reponsePdf = await serveur.inject({
    method: 'GET',
    url: '/syntheses/ecole/ecole-1/pdf?idAnneeScolaire=annee-1&codeColonne=TOTAL_GENERAL',
    headers: { 'x-tenant-id': 'ecole-1' },
  });
  assert.equal(reponsePdf.statusCode, 200);

  const reponseInit = await serveur.inject({
    method: 'POST',
    url: '/syntheses/initialiser',
    headers: { 'x-tenant-id': 'ecole-1' },
    payload: {
      idEcole: 'ecole-1',
      idAnneeScolaire: 'annee-1',
      codeColonne: 'TOTAL_GENERAL',
      typeSynthese: 'ANNUELLE',
    },
  });
  assert.equal(reponseInit.statusCode, 201);

  await serveur.close();
});
