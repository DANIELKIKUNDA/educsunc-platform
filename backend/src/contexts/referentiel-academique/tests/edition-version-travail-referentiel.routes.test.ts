import test from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import { RequestContextFactory } from 'shared/context';
import { ErreurAccesRefuse } from '../../../shared/security/application/exceptions/ErreurAccesRefuse';
import { ErreurMigrationImpossible } from '../domain/exceptions/ErreurMigrationImpossible';
import { ControleurReferentielsAcademiques } from '../interfaces/http/controllers/ControleurReferentielsAcademiques';
import { creerRoutesReferentielsAcademiques } from '../interfaces/http/routes/referentiels-academiques.routes';

test('la route de creation de version de travail transmet le contexte authentifie', async () => {
  const serveur = Fastify();
  const appels: string[] = [];

  serveur.addHook('onRequest', async (requete) => {
    requete.context = RequestContextFactory.creerContexteInitial({ requestId: 'req-ref-edit-01' });
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
      async creerVersionTravailReferentielDepuisVersion(_params: unknown, _body: unknown, context: { utilisateurId?: string }) {
        appels.push(`creer-version:${context.utilisateurId ?? 'none'}`);
        return { donnee: { id: 'version-wip-1' } };
      },
      async ajouterLigneVersionReferentiel() { return { donnee: {} }; },
      async modifierLigneVersionReferentiel() { return { donnee: {} }; },
      async retirerLigneVersionReferentiel() { return { donnee: {} }; },
      async reordonnerLignesVersionReferentiel() { return { donnee: {} }; },
      async modifierPonderationLigneVersionReferentiel() { return { donnee: {} }; },
      async verifierCoherenceVersionReferentiel() { return { donnee: {} }; },
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

  const reponse = await serveur.inject({
    method: 'POST',
    url: '/api/referentiels/programmes/ref-1/versions-travail',
    payload: {
      idVersionSource: 'version-1',
      codeVersion: '2026-V2-WIP',
      anneeReference: '2026',
      datePublication: '2026-07-10T00:00:00.000Z',
    },
  });

  assert.equal(reponse.statusCode, 200, reponse.body);
  assert.deepEqual(appels, ['creer-version:user-manager']);

  await serveur.close();
});

test('la route d ajout de ligne transmet le contexte authentifie', async () => {
  const serveur = Fastify();
  const appels: string[] = [];

  serveur.addHook('onRequest', async (requete) => {
    requete.context = RequestContextFactory.creerContexteInitial({ requestId: 'req-ref-edit-02' });
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
      async creerVersionTravailReferentielDepuisVersion() { return { donnee: {} }; },
      async ajouterLigneVersionReferentiel(_params: unknown, _body: unknown, context: { utilisateurId?: string }) {
        appels.push(`ajouter-ligne:${context.utilisateurId ?? 'none'}`);
        return { donnee: { id: 'version-wip-1' } };
      },
      async modifierLigneVersionReferentiel() { return { donnee: {} }; },
      async retirerLigneVersionReferentiel() { return { donnee: {} }; },
      async reordonnerLignesVersionReferentiel() { return { donnee: {} }; },
      async modifierPonderationLigneVersionReferentiel() { return { donnee: {} }; },
      async verifierCoherenceVersionReferentiel() { return { donnee: {} }; },
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

  const reponse = await serveur.inject({
    method: 'POST',
    url: '/api/referentiels/versions/version-1/lignes',
    payload: {
      idReferentielCours: 'cours-1',
      ordreAffichage: 1,
      obligatoire: true,
      aExamen: false,
      estCalculable: true,
      ponderation: {
        maxP1: 10,
        maxP2: 10,
        maxEX1: 0,
        maxP3: 10,
        maxP4: 10,
        maxEX2: 0,
        maxP5: 0,
        maxP6: 0,
        maxEX3: 0,
      },
    },
  });

  assert.equal(reponse.statusCode, 200, reponse.body);
  assert.deepEqual(appels, ['ajouter-ligne:user-manager']);

  await serveur.close();
});

test('la route d ajout de ligne repond 400 si la ponderation est invalide', async () => {
  const serveur = Fastify();

  serveur.addHook('onRequest', async (requete) => {
    requete.context = RequestContextFactory.creerContexteInitial({ requestId: 'req-ref-edit-03' });
    requete.context = RequestContextFactory.enrichirAuth(requete.context, {
      utilisateurId: 'user-manager',
      roleActif: 'MANAGER_SYSTEME',
    });
  });

  const controleur = new ControleurReferentielsAcademiques(
    {
      async importerSectionsDepuisJson() { return { sectionsImportees: 0 }; },
      async importerOptionsDepuisJson() { return { optionsImportees: 0 }; },
      async importerClassesAcademiquesDepuisJson() { return { classesAcademiquesImportees: 0 }; },
      async importerCoursAcademiquesDepuisJson() { return { coursImportes: 0 }; },
      async importerProgrammesAcademiquesDepuisJson() { return { programmesImportes: 0 }; },
      async importerLignesProgrammeDepuisJson() { return { lignesImportees: 0 }; },
    } as never,
    { executer: async () => ({ versionReferentielProgramme: {} }) } as never,
    { executer: async () => ({ versionReferentielProgramme: {} }) } as never,
    { executer: async () => ({}) } as never,
    { executer: async () => ({ referentielProgramme: {} }) } as never,
    { executer: async () => ({ referentielsProgrammes: [], total: 0, page: 1, taillePage: 20 }) } as never,
    { executer: async () => ({ referentielsCours: [], total: 0, page: 1, taillePage: 20 }) } as never,
    {
      async verifierMutationImportReferentiel() {},
    } as never,
    {
      async verifierMutationPublicationReferentiel() {},
    } as never,
    {
      async verifierMutationActivationReferentiel() {},
    } as never,
    undefined as never,
    undefined as never,
    undefined as never,
    {
      async executer() { return { versionReferentielProgramme: {} }; },
    } as never,
  );

  await serveur.register(creerRoutesReferentielsAcademiques({
    controleurReferentielsAcademiques: controleur as never,
    executerRouteTenant: async (_requete, operation) => operation(),
    executerRouteIdempotente: async (_requete, operation) => operation(),
  }));

  const reponse = await serveur.inject({
    method: 'POST',
    url: '/api/referentiels/versions/version-1/lignes',
    payload: {
      idReferentielCours: 'cours-1',
      ordreAffichage: 1,
      obligatoire: true,
      aExamen: false,
      estCalculable: true,
      ponderation: {
        maxP1: 10,
      },
    },
  });

  assert.equal(reponse.statusCode, 400, reponse.body);
  assert.match(reponse.body, /maxP2/);

  await serveur.close();
});

test('la route d ajout de ligne repond 403 sur refus d acces', async () => {
  const serveur = Fastify();

  serveur.addHook('onRequest', async (requete) => {
    requete.context = RequestContextFactory.creerContexteInitial({ requestId: 'req-ref-edit-04' });
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
      async creerVersionTravailReferentielDepuisVersion() { return { donnee: {} }; },
      async ajouterLigneVersionReferentiel() {
        throw new ErreurAccesRefuse("L'acteur courant n'est pas autorise a modifier une version officielle du referentiel.");
      },
      async modifierLigneVersionReferentiel() { return { donnee: {} }; },
      async retirerLigneVersionReferentiel() { return { donnee: {} }; },
      async reordonnerLignesVersionReferentiel() { return { donnee: {} }; },
      async modifierPonderationLigneVersionReferentiel() { return { donnee: {} }; },
      async verifierCoherenceVersionReferentiel() { return { donnee: {} }; },
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

  const reponse = await serveur.inject({
    method: 'POST',
    url: '/api/referentiels/versions/version-1/lignes',
    payload: {
      idReferentielCours: 'cours-1',
      ordreAffichage: 1,
      obligatoire: true,
      aExamen: false,
      estCalculable: true,
      ponderation: {
        maxP1: 10,
        maxP2: 10,
        maxEX1: 0,
        maxP3: 10,
        maxP4: 10,
        maxEX2: 0,
        maxP5: 0,
        maxP6: 0,
        maxEX3: 0,
      },
    },
  });

  assert.equal(reponse.statusCode, 403, reponse.body);
  assert.match(reponse.body, /REFERENTIEL_FORBIDDEN/);

  await serveur.close();
});

test('la route de modification repond 409 si la version est deja engagee dans une migration', async () => {
  const serveur = Fastify();

  serveur.addHook('onRequest', async (requete) => {
    requete.context = RequestContextFactory.creerContexteInitial({ requestId: 'req-ref-edit-05' });
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
      async creerVersionTravailReferentielDepuisVersion() { return { donnee: {} }; },
      async ajouterLigneVersionReferentiel() { return { donnee: {} }; },
      async modifierLigneVersionReferentiel() {
        throw new ErreurMigrationImpossible(
          'Cette version a deja ete engagee dans une migration et ne peut plus etre modifiee.',
        );
      },
      async retirerLigneVersionReferentiel() { return { donnee: {} }; },
      async reordonnerLignesVersionReferentiel() { return { donnee: {} }; },
      async modifierPonderationLigneVersionReferentiel() { return { donnee: {} }; },
      async verifierCoherenceVersionReferentiel() { return { donnee: {} }; },
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

  const reponse = await serveur.inject({
    method: 'PATCH',
    url: '/api/referentiels/versions/version-1/lignes/ligne-1',
    payload: {
      obligatoire: false,
    },
  });

  assert.equal(reponse.statusCode, 409, reponse.body);
  assert.match(reponse.body, /REFERENTIEL_CONFLICT/);

  await serveur.close();
});
