import test from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import { RequestContextFactory } from 'shared/context';
import { creerRoutesSocleAcademique } from '../interfaces/http/routes/socle-academique.routes';

test('les routes du socle academique exposent ACA-08 sans melanger les classes pedagogiques', async () => {
  const serveur = Fastify();
  const appels: string[] = [];

  serveur.addHook('onRequest', async (requete) => {
    requete.context = RequestContextFactory.creerContexteInitial({ requestId: 'req-aca-08' });
    requete.context = RequestContextFactory.enrichirAuth(requete.context, {
      utilisateurId: 'user-systeme',
      roleActif: 'MANAGER_SYSTEME',
      organisationActiveId: 'org-a',
      ecoleActiveId: 'ecole-a-1',
    });
  });

  await serveur.register(creerRoutesSocleAcademique({
    controleurStructureScolaire: {
      async creerSectionScolaire(_body: unknown, context: { utilisateurId?: string }) {
        appels.push(`creer-section:${context.utilisateurId ?? 'none'}`);
        return { donnee: { id: 'section-1' } };
      },
      async creerClasseAcademique(_body: unknown, context: { utilisateurId?: string }) {
        appels.push(`creer-classe:${context.utilisateurId ?? 'none'}`);
        return { donnee: { id: 'classe-1' } };
      },
      async creerOptionEtude(_body: unknown, context: { utilisateurId?: string }) {
        appels.push(`creer-option:${context.utilisateurId ?? 'none'}`);
        return { donnee: { id: 'option-1' } };
      },
      async listerSectionsScolaires(_query: unknown, context: { utilisateurId?: string }) {
        appels.push(`lister-sections:${context.utilisateurId ?? 'none'}`);
        return { donnees: [], pagination: { total: 0, page: 1, taillePage: 20, totalPages: 0 } };
      },
      async listerClassesAcademiques(_query: unknown, context: { utilisateurId?: string }) {
        appels.push(`lister-classes:${context.utilisateurId ?? 'none'}`);
        return { donnees: [], pagination: { total: 0, page: 1, taillePage: 20, totalPages: 0 } };
      },
      async listerOptionsEtudes(_query: unknown, context: { utilisateurId?: string }) {
        appels.push(`lister-options:${context.utilisateurId ?? 'none'}`);
        return { donnees: [], pagination: { total: 0, page: 1, taillePage: 20, totalPages: 0 } };
      },
    } as never,
    executerRouteTenant: async (_requete, operation) => operation(),
    executerRouteIdempotente: async (_requete, operation) => operation(),
  }));

  const reponse = await serveur.inject({
    method: 'GET',
    url: '/api/sections-scolaires',
  });

  assert.equal(reponse.statusCode, 200, reponse.body);
  assert.deepEqual(appels, ['lister-sections:user-systeme']);

  const routeClassesPedagogiques = await serveur.inject({
    method: 'GET',
    url: '/api/classes-pedagogiques',
  });

  assert.equal(routeClassesPedagogiques.statusCode, 404);

  await serveur.close();
});
