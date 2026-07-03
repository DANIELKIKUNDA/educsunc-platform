import test from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import { RequestContextFactory } from 'shared/context';
import { ErreurAccesRefuse } from '../../../shared/security/application/exceptions/ErreurAccesRefuse';
import { creerRoutesReferentielsAcademiques } from '../interfaces/http/routes/referentiels-academiques.routes';

test('la route de comparaison referentiel transmet le contexte authentifie au workflow plateforme', async () => {
  const serveur = Fastify();
  const appels: string[] = [];

  serveur.addHook('onRequest', async (requete) => {
    requete.context = RequestContextFactory.creerContexteInitial({ requestId: 'req-plt-04' });
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
      async comparerDeuxVersionsReferentiel(_body: unknown, context: { utilisateurId?: string }) {
        appels.push(`comparer:${context.utilisateurId ?? 'none'}`);
        return { donnee: { differences: [] } };
      },
      async listerReferentielsProgrammes() {
        return { donnees: [], pagination: { total: 0, page: 1, taillePage: 20, totalPages: 0 } };
      },
      async listerReferentielsCours() {
        return { donnees: [], pagination: { total: 0, page: 1, taillePage: 20, totalPages: 0 } };
      },
      async consulterReferentielProgramme() { return { donnee: {} }; },
    } as never,
    executerRouteTenant: async (_requete, operation) => operation(),
    executerRouteIdempotente: async (_requete, operation) => operation(),
  }));

  const reponseComparaison = await serveur.inject({
    method: 'POST',
    url: '/api/referentiels/comparer',
    payload: {
      idClasseAcademique: 'classe-1',
      versionReferentielSource: '2026-V1',
      versionReferentielCible: '2026-V2',
    },
  });

  assert.equal(reponseComparaison.statusCode, 200, reponseComparaison.body);
  assert.deepEqual(appels, ['comparer:user-manager']);

  await serveur.close();
});

test('la route de comparaison referentiel repond 401 sans utilisateur courant', async () => {
  const serveur = Fastify();

  serveur.addHook('onRequest', async (requete) => {
    requete.context = RequestContextFactory.creerContexteInitial({ requestId: 'req-plt-04b' });
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
      async comparerDeuxVersionsReferentiel() { throw new Error('Ne doit pas etre appele sans authentification.'); },
      async listerReferentielsProgrammes() { return { donnees: [], pagination: { total: 0, page: 1, taillePage: 20, totalPages: 0 } }; },
      async listerReferentielsCours() { return { donnees: [], pagination: { total: 0, page: 1, taillePage: 20, totalPages: 0 } }; },
      async consulterReferentielProgramme() { return { donnee: {} }; },
    } as never,
    executerRouteTenant: async (_requete, operation) => operation(),
    executerRouteIdempotente: async (_requete, operation) => operation(),
  }));

  const reponse = await serveur.inject({
    method: 'POST',
    url: '/api/referentiels/comparer',
    payload: {},
  });

  assert.equal(reponse.statusCode, 401, reponse.body);
  assert.match(reponse.body, /REFERENTIEL_AUTH_REQUIRED/);

  await serveur.close();
});

test('la route de comparaison referentiel traduit un refus d acces en 403', async () => {
  const serveur = Fastify();

  serveur.addHook('onRequest', async (requete) => {
    requete.context = RequestContextFactory.creerContexteInitial({ requestId: 'req-plt-04c' });
    requete.context = RequestContextFactory.enrichirAuth(requete.context, {
      utilisateurId: 'user-support',
      roleActif: 'SUPPORT_SYSTEME',
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
      async comparerDeuxVersionsReferentiel() { throw new ErreurAccesRefuse("L'acteur courant n'est pas autorise a comparer des versions officielles du referentiel."); },
      async listerReferentielsProgrammes() { return { donnees: [], pagination: { total: 0, page: 1, taillePage: 20, totalPages: 0 } }; },
      async listerReferentielsCours() { return { donnees: [], pagination: { total: 0, page: 1, taillePage: 20, totalPages: 0 } }; },
      async consulterReferentielProgramme() { return { donnee: {} }; },
    } as never,
    executerRouteTenant: async (_requete, operation) => operation(),
    executerRouteIdempotente: async (_requete, operation) => operation(),
  }));

  const reponse = await serveur.inject({
    method: 'POST',
    url: '/api/referentiels/comparer',
    payload: {},
  });

  assert.equal(reponse.statusCode, 403, reponse.body);
  assert.match(reponse.body, /REFERENTIEL_FORBIDDEN/);

  await serveur.close();
});
