import test from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import { RequestContextFactory } from 'shared/context';
import { ErreurAccesRefuse } from '../../../shared/security/application/exceptions/ErreurAccesRefuse';
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

test('les routes de lecture referentiel repondent 401 sans utilisateur courant', async () => {
  const serveur = Fastify();

  serveur.addHook('onRequest', async (requete) => {
    requete.context = RequestContextFactory.creerContexteInitial({ requestId: 'req-plt-05b' });
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
      async listerReferentielsProgrammes() { throw new Error('Ne doit pas etre appele sans authentification.'); },
      async listerReferentielsCours() { return { donnees: [], pagination: { total: 0, page: 1, taillePage: 20, totalPages: 0 } }; },
      async consulterReferentielProgramme() { return { donnee: {} }; },
    } as never,
    executerRouteTenant: async (_requete, operation) => operation(),
    executerRouteIdempotente: async (_requete, operation) => operation(),
  }));

  const reponse = await serveur.inject({
    method: 'GET',
    url: '/api/referentiels/programmes?idClasseAcademique=classe-1&page=1&taillePage=20',
  });

  assert.equal(reponse.statusCode, 401, reponse.body);
  assert.match(reponse.body, /REFERENTIEL_AUTH_REQUIRED/);

  await serveur.close();
});

test('les routes de lecture referentiel traduisent un refus d acces en 403', async () => {
  const serveur = Fastify();

  serveur.addHook('onRequest', async (requete) => {
    requete.context = RequestContextFactory.creerContexteInitial({ requestId: 'req-plt-05c' });
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
      async comparerDeuxVersionsReferentiel() { return { donnee: {} }; },
      async listerReferentielsProgrammes() { throw new ErreurAccesRefuse("L'acteur courant n'est pas autorise a consulter les referentiels officiels."); },
      async listerReferentielsCours() { return { donnees: [], pagination: { total: 0, page: 1, taillePage: 20, totalPages: 0 } }; },
      async consulterReferentielProgramme() { return { donnee: {} }; },
    } as never,
    executerRouteTenant: async (_requete, operation) => operation(),
    executerRouteIdempotente: async (_requete, operation) => operation(),
  }));

  const reponse = await serveur.inject({
    method: 'GET',
    url: '/api/referentiels/programmes?idClasseAcademique=classe-1&page=1&taillePage=20',
  });

  assert.equal(reponse.statusCode, 403, reponse.body);
  assert.match(reponse.body, /REFERENTIEL_FORBIDDEN/);

  await serveur.close();
});
