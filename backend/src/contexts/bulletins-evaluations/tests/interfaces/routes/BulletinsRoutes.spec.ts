import test from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import { creerBulletinsRoutes } from 'contexts/bulletins-evaluations/interfaces/http/routes/bulletins.routes';
import { ContexteTenant } from 'shared/tenancy/TenantContext';

// Ce fichier couvre le branchement des routes HTTP documentaires du BC.
test('les routes bulletins exposent bien les endpoints principaux', async () => {
  const serveur = Fastify();
  const contexteTenant = new ContexteTenant();
  let consultationHeaders: Record<string, unknown> | undefined;
  await serveur.register(creerBulletinsRoutes({
    bulletinsController: {
      async generer() { return { donnee: { ok: true } }; },
      async consulter(_params: unknown, headers: unknown) {
        consultationHeaders = headers as Record<string, unknown>;
        return { donnee: { ok: true } };
      },
      async telechargerPdf() { return { donnee: { ok: true } }; },
      async consulterHistorique() { return { donnee: [{ version: 1 }] }; },
    } as never,
    contexteTenant,
  } as never));

  const reponse = await serveur.inject({
    method: 'GET',
    url: '/bulletins/eleve-1/annee-1',
    headers: { 'x-tenant-id': 'ecole-1', 'x-user-id': 'user-1' },
  });
  assert.equal(reponse.statusCode, 200);
  assert.equal(consultationHeaders?.['x-user-id'], 'user-1');
  assert.equal(contexteTenant.estEnLectureOrganisationnelle(), false);
  await serveur.close();
});
