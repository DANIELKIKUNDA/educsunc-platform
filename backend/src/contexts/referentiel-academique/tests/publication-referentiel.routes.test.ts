import test from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import { RequestContextFactory } from 'shared/context';
import { ErreurAccesRefuse } from '../../../shared/security/application/exceptions/ErreurAccesRefuse';
import { creerExecuteurRouteIdempotenteReferentielAcademique } from '../interfaces/http/routes/ExecutionRouteIdempotenteReferentielAcademique';
import { creerRoutesReferentielsAcademiques } from '../interfaces/http/routes/referentiels-academiques.routes';

test('la route de publication referentiel transmet le contexte authentifie et n expose plus publiePar comme saisie libre', async () => {
  const serveur = Fastify();
  const appels: string[] = [];

  serveur.addHook('onRequest', async (requete) => {
    requete.context = RequestContextFactory.creerContexteInitial({ requestId: 'req-plt-01' });
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
      async publierVersionReferentiel(_body: unknown, context: { utilisateurId?: string }) {
        appels.push(`publier:${context.utilisateurId ?? 'none'}`);
        return { donnee: { id: 'version-1' } };
      },
      async activerVersionReferentiel() { return { donnee: {} }; },
      async comparerDeuxVersionsReferentiel() { return { donnee: {} }; },
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

  const reponsePublication = await serveur.inject({
    method: 'POST',
    url: '/api/referentiels/versions',
    payload: {
      idReferentielProgramme: 'ref-1',
      codeVersion: '2026-V1',
      anneeReference: '2026',
      datePublication: '2026-03-31T00:00:00.000Z',
      sourceImport: 'JSON_OFFICIEL',
      motifPublication: 'Publication officielle',
    },
  });

  assert.equal(reponsePublication.statusCode, 200, reponsePublication.body);
  assert.deepEqual(appels, ['publier:user-manager']);

  await serveur.close();
});

test('la route de publication referentiel repond 401 sans utilisateur courant', async () => {
  const serveur = Fastify();

  serveur.addHook('onRequest', async (requete) => {
    requete.context = RequestContextFactory.creerContexteInitial({ requestId: 'req-plt-01b' });
  });

  await serveur.register(creerRoutesReferentielsAcademiques({
    controleurReferentielsAcademiques: {
      async importerSectionsDepuisJson() { return { donnee: {} }; },
      async importerOptionsDepuisJson() { return { donnee: {} }; },
      async importerClassesAcademiquesDepuisJson() { return { donnee: {} }; },
      async importerCoursAcademiquesDepuisJson() { return { donnee: {} }; },
      async importerProgrammesAcademiquesDepuisJson() { return { donnee: {} }; },
      async importerLignesProgrammeDepuisJson() { return { donnee: {} }; },
      async publierVersionReferentiel() { throw new Error('Ne doit pas etre appele sans authentification.'); },
      async activerVersionReferentiel() { return { donnee: {} }; },
      async comparerDeuxVersionsReferentiel() { return { donnee: {} }; },
      async listerReferentielsProgrammes() { return { donnees: [], pagination: { total: 0, page: 1, taillePage: 20, totalPages: 0 } }; },
      async listerReferentielsCours() { return { donnees: [], pagination: { total: 0, page: 1, taillePage: 20, totalPages: 0 } }; },
      async consulterReferentielProgramme() { return { donnee: {} }; },
    } as never,
    executerRouteTenant: async (_requete, operation) => operation(),
    executerRouteIdempotente: async (_requete, operation) => operation(),
  }));

  const reponse = await serveur.inject({
    method: 'POST',
    url: '/api/referentiels/versions',
    payload: {},
  });

  assert.equal(reponse.statusCode, 401, reponse.body);
  assert.match(reponse.body, /REFERENTIEL_AUTH_REQUIRED/);

  await serveur.close();
});

test('la route de publication referentiel traduit un refus d acces en 403', async () => {
  const serveur = Fastify();

  serveur.addHook('onRequest', async (requete) => {
    requete.context = RequestContextFactory.creerContexteInitial({ requestId: 'req-plt-01c' });
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
      async publierVersionReferentiel() { throw new ErreurAccesRefuse("L'acteur courant n'est pas autorise a publier une version officielle du referentiel."); },
      async activerVersionReferentiel() { return { donnee: {} }; },
      async comparerDeuxVersionsReferentiel() { return { donnee: {} }; },
      async listerReferentielsProgrammes() { return { donnees: [], pagination: { total: 0, page: 1, taillePage: 20, totalPages: 0 } }; },
      async listerReferentielsCours() { return { donnees: [], pagination: { total: 0, page: 1, taillePage: 20, totalPages: 0 } }; },
      async consulterReferentielProgramme() { return { donnee: {} }; },
    } as never,
    executerRouteTenant: async (_requete, operation) => operation(),
    executerRouteIdempotente: async (_requete, operation) => operation(),
  }));

  const reponse = await serveur.inject({
    method: 'POST',
    url: '/api/referentiels/versions',
    payload: {},
  });

  assert.equal(reponse.statusCode, 403, reponse.body);
  assert.match(reponse.body, /REFERENTIEL_FORBIDDEN/);

  await serveur.close();
});

test('la route de publication referentiel repond 400 si la cle idempotente manque apres authentification', async () => {
  const serveur = Fastify();

  serveur.addHook('onRequest', async (requete) => {
    requete.context = RequestContextFactory.creerContexteInitial({ requestId: 'req-plt-01d' });
    requete.context = RequestContextFactory.enrichirAuth(requete.context, {
      utilisateurId: 'user-manager',
      roleActif: 'MANAGER_SYSTEME',
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
      async listerReferentielsProgrammes() { return { donnees: [], pagination: { total: 0, page: 1, taillePage: 20, totalPages: 0 } }; },
      async listerReferentielsCours() { return { donnees: [], pagination: { total: 0, page: 1, taillePage: 20, totalPages: 0 } }; },
      async consulterReferentielProgramme() { return { donnee: {} }; },
    } as never,
    executerRouteTenant: async (_requete, operation) => operation(),
    executerRouteIdempotente: creerExecuteurRouteIdempotenteReferentielAcademique({
      async existe() { return false; },
      async obtenir() { return null; },
      async enregistrer() {},
      async marquerResultat() {},
      async supprimerExpirees() { return 0; },
    }),
  }));

  const reponse = await serveur.inject({
    method: 'POST',
    url: '/api/referentiels/versions',
    payload: {},
  });

  assert.equal(reponse.statusCode, 400, reponse.body);
  assert.match(reponse.body, /CLE_IDEMPOTENCE_HTTP_OBLIGATOIRE/);

  await serveur.close();
});
