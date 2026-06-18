import test from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import { RequestContextFactory } from 'shared/context';
import { creerRoutesReferentielsAcademiques } from '../interfaces/http/routes/referentiels-academiques.routes';

test('les routes de lecture referentiel transmettent le contexte authentifie au workflow plateforme', async () => {
  const serveur = Fastify();
  const appels: string[] = [];

  serveur.addHook('onRequest', async (requete) => {
    requete.context = RequestContextFactory.creerContexteInitial({ requestId: 'req-plt-05' });
    requete.context = RequestContextFactory.enrichirAuth(requete.context, {
      utilisateurId: 'user-manager',
      roleActif: 'MANAGER_SYSTEME',
      organisationActiveId: 'org-a',
      ecoleActiveId: 'ecole-a-1',
    });
  });

  await serveur.register(creerRoutesReferentielsAcademiques({
    controleurReferentielsAcademiques: {
      async importerSectionsDepuisJson() { return { donnee: {} }; },
      async importerOptionsDepuisJson() { return { donnee: {} }; },
      async importerClassesAcademiquesDepuisJson() { return { donnee: {} }; },
      async importerCoursAcademiquesDepuisJson() { return { donnee: {} }; },
      async importerProgrammesAcademiquesDepuisJson() { return { donnee: {} }; },
      async importerLignesProgrammeDepuisJson() { return { donnee: {} }; },
      async publierVersionReferentiel() { return { donnee: {} }; },
      async activerVersionReferentiel() { return { donnee: {} }; },
      async comparerDeuxVersionsReferentiel() { return { donnee: {} }; },
      async listerReferentielsProgrammes(_query: unknown, context: { utilisateurId?: string }) {
        appels.push(`programmes:${context.utilisateurId ?? 'none'}`);
        return { donnees: [], pagination: { total: 0, page: 1, taillePage: 20, totalPages: 0 } };
      },
      async listerReferentielsCours(_query: unknown, context: { utilisateurId?: string }) {
        appels.push(`cours:${context.utilisateurId ?? 'none'}`);
        return { donnees: [], pagination: { total: 0, page: 1, taillePage: 20, totalPages: 0 } };
      },
      async consulterReferentielProgramme(_params: unknown, context: { utilisateurId?: string }) {
        appels.push(`programme:${context.utilisateurId ?? 'none'}`);
        return { donnee: {} };
      },
    } as never,
    executerRouteTenant: async (_requete, operation) => operation(),
    executerRouteIdempotente: async (_requete, operation) => operation(),
  }));

  const reponseListeProgrammes = await serveur.inject({
    method: 'GET',
    url: '/api/referentiels/programmes?idClasseAcademique=classe-1&page=1&taillePage=20',
  });
  const reponseListeCours = await serveur.inject({
    method: 'GET',
    url: '/api/referentiels/cours?page=1&taillePage=20',
  });
  const reponseConsultation = await serveur.inject({
    method: 'GET',
    url: '/api/referentiels/programmes/programme-1',
  });

  assert.equal(reponseListeProgrammes.statusCode, 200, reponseListeProgrammes.body);
  assert.equal(reponseListeCours.statusCode, 200, reponseListeCours.body);
  assert.equal(reponseConsultation.statusCode, 200, reponseConsultation.body);
  assert.deepEqual(appels, [
    'programmes:user-manager',
    'cours:user-manager',
    'programme:user-manager',
  ]);

  await serveur.close();
});
